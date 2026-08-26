/**
 * sessionId: list every known session and offer a handful of client-side
 * mutations. The list comes from the live session catalog RPC
 * (`connection.api.sessions.list`), so it stays in sync with sessions the
 * Host knows about. The mutations (rename, cancel, create) round-trip
 * through the same connection so the visible list updates without a
 * manual refresh.
 *
 * Clipboard access requires a secure context, so the copy helpers report
 * a diagnostic when the secure-context API is unavailable.
 */
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'

export interface SessionSummary {
  readonly sessionId: string
  readonly title?: string
  readonly cwd?: string
  readonly updatedAt?: number
  readonly running?: boolean
  readonly blank?: boolean
}

export type SessionStatus = 'all' | 'running' | 'idle'

export interface SessionListResult {
  readonly sessions: readonly SessionSummary[]
  readonly error?: string
}

/** Minimal untyped face over `connection.api.sessions.*`. */
interface ConnectionLike {
  api: {
    sessions: {
      list(input: object): Promise<{
        result: { ok: true; value: { items: unknown[] } } | { ok: false; error: { message: string } }
      }>
      create(input: { sessionId?: string; cwd?: string }): Promise<{
        result: { ok: true; value: { sessionId: string } } | { ok: false; error: { message: string } }
      }>
      rename(input: { sessionId: string; title: string }): Promise<{
        result: { ok: true; value: unknown } | { ok: false; error: { message: string } }
      }>
      cancel(input: { sessionId: string }): Promise<{
        result: { ok: true; value: unknown } | { ok: false; error: { message: string } }
      }>
    }
  }
}

function isString(value: unknown): value is string {
  return typeof value === 'string'
}

function asSummary(value: unknown): SessionSummary | undefined {
  if (typeof value !== 'object' || value === null) return undefined
  const candidate = value as Record<string, unknown>
  if (!isString(candidate.sessionId)) return undefined
  return {
    sessionId: candidate.sessionId,
    ...(isString(candidate.title) ? { title: candidate.title } : {}),
    ...(isString(candidate.cwd) ? { cwd: candidate.cwd } : {}),
    ...(typeof candidate.updatedAt === 'number' ? { updatedAt: candidate.updatedAt } : {}),
    ...(typeof candidate.running === 'boolean' ? { running: candidate.running } : {}),
    ...(typeof candidate.blank === 'boolean' ? { blank: candidate.blank } : {}),
  }
}

function unwrap<T>(response: { result: { ok: true; value: T } | { ok: false; error: { message: string } } }): { ok: true; value: T } | { ok: false; error: string } {
  if (response.result.ok) return { ok: true, value: response.result.value }
  return { ok: false, error: response.result.error.message }
}

/**
 * Pull the session list through the loopback connection. The list shape is
 * `{ items: SessionSummary[] }` per the upstream `sessions/list` contract;
 * unknown entries are dropped silently so a future Host-side addition does
 * not crash the page.
 */
export async function listSessions(ctx: ClientContext): Promise<SessionListResult> {
  const conn = ctx.get('connection') as ConnectionLike | undefined
  if (conn === undefined) return { sessions: [], error: 'connection service missing' }
  const response = await conn.api.sessions.list({})
  if (!response.result.ok) return { sessions: [], error: response.result.error.message }
  const items = Array.isArray(response.result.value.items) ? response.result.value.items : []
  const sessions: SessionSummary[] = []
  for (const item of items) {
    const summary = asSummary(item)
    if (summary !== undefined) sessions.push(summary)
  }
  return { sessions }
}

export interface CopyOutcome {
  ok: boolean
  message: string
}

/**
 * Copy a string to the clipboard. Uses `navigator.clipboard.writeText` when
 * the secure-context API is available; otherwise it tries the legacy
 * `document.execCommand('copy')` fallback through a hidden textarea so the
 * feature still works in non-secure-context preview builds.
 */
export async function copyToClipboard(text: string): Promise<CopyOutcome> {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText !== undefined) {
    try {
      await navigator.clipboard.writeText(text)
      return { ok: true, message: 'clipboard.writeText' }
    } catch (error) {
      return { ok: false, message: `clipboard.writeText rejected: ${error instanceof Error ? error.message : String(error)}` }
    }
  }
  if (typeof document === 'undefined') {
    return { ok: false, message: 'no clipboard API available' }
  }
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'absolute'
  textarea.style.left = '-9999px'
  document.body.appendChild(textarea)
  textarea.select()
  try {
    const success = document.execCommand('copy')
    document.body.removeChild(textarea)
    return success
      ? { ok: true, message: 'execCommand' }
      : { ok: false, message: 'execCommand returned false' }
  } catch (error) {
    document.body.removeChild(textarea)
    return { ok: false, message: `execCommand threw: ${error instanceof Error ? error.message : String(error)}` }
  }
}

export interface SessionMutationResult {
  readonly ok: boolean
  readonly sessionId?: string
  readonly message: string
}

function sessionResult(response: { result: { ok: true; value: unknown } | { ok: false; error: { message: string } } }, fallback: string): SessionMutationResult {
  const unwrapped = unwrap(response)
  if (unwrapped.ok) return { ok: true, message: fallback }
  return { ok: false, message: unwrapped.error }
}

export async function createSession(ctx: ClientContext, cwd: string): Promise<SessionMutationResult> {
  const conn = ctx.get('connection') as ConnectionLike | undefined
  if (conn === undefined) return { ok: false, message: 'connection service missing' }
  const trimmed = cwd.trim()
  const response = await conn.api.sessions.create(trimmed.length === 0 ? {} : { cwd: trimmed })
  return sessionResult(response, 'session created')
}

export async function renameSession(ctx: ClientContext, sessionId: string, title: string): Promise<SessionMutationResult> {
  const conn = ctx.get('connection') as ConnectionLike | undefined
  if (conn === undefined) return { ok: false, message: 'connection service missing' }
  const trimmed = title.trim()
  if (trimmed.length === 0) return { ok: false, message: 'title cannot be empty' }
  const response = await conn.api.sessions.rename({ sessionId, title: trimmed })
  return sessionResult(response, 'renamed')
}

export async function cancelSession(ctx: ClientContext, sessionId: string): Promise<SessionMutationResult> {
  const conn = ctx.get('connection') as ConnectionLike | undefined
  if (conn === undefined) return { ok: false, message: 'connection service missing' }
  const response = await conn.api.sessions.cancel({ sessionId })
  return sessionResult(response, 'cancel sent')
}

/** Filter the session list by a coarse status selector. */
export function filterSessions(
  sessions: readonly SessionSummary[],
  status: SessionStatus,
): readonly SessionSummary[] {
  if (status === 'all') return sessions
  if (status === 'running') return sessions.filter((entry) => entry.running === true)
  return sessions.filter((entry) => entry.running !== true)
}

/** Flatten the visible sessions into a newline-joined id list. */
export function joinSessionIds(sessions: readonly SessionSummary[]): string {
  return sessions.map((entry) => entry.sessionId).join('\n')
}