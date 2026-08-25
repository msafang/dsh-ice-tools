/**
 * sessionId: list every known session and let the user copy one id to the
 * clipboard. The list comes from the live session catalog RPC
 * (`connection.api.sessions.list`), so it stays in sync with sessions the
 * Host knows about. The button falls back to the browser's `navigator.clipboard`
 * API; clipboard access requires a secure context, so the code reports a
 * diagnostic when it is unavailable.
 */
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'

export interface SessionSummary {
  readonly sessionId: string
  readonly title?: string
  readonly updatedAt?: number
  readonly running?: boolean
}

export interface SessionListResult {
  readonly sessions: readonly SessionSummary[]
  readonly error?: string
}

/** Minimal untyped face over `connection.api.sessions.list`. */
interface ConnectionLike {
  api: {
    sessions: {
      list(input: object): Promise<{
        result: { ok: true; value: { items: unknown[] } } | { ok: false; error: { message: string } }
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
    ...(typeof candidate.updatedAt === 'number' ? { updatedAt: candidate.updatedAt } : {}),
    ...(typeof candidate.running === 'boolean' ? { running: candidate.running } : {}),
  }
}

/**
 * Pull the session list through the loopback connection. The list shape is
 * `{ items: SessionSummary[] }` per the upstream `sessions/list` contract;
 * unknown entries are dropped silently so a future Host-side addition does
 * not crash the doctor.
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