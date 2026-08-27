/**
 * chatRecovery: client-only session failure log. The user reports a failed
 * session by entering its id and a short description; the entry lands in
 * localStorage so it survives restarts and reloads. The block lists every
 * reported failure with its status (open / recovered / dismissed), a copy
 * button for the id, and a status toggle so the user can mark a session as
 * recovered or dismissed. Export and import work through JSON so a user
 * can move a failure log between machines.
 *
 * The block is intentionally manual: the Host-side failure event stream is
 * not yet plumbed into the plugin, so the log is owned by the user. A
 * future revision can swap the manual input for a hook against
 * `session/turn-end` events without changing the public surface.
 */

export interface FailedSession {
  readonly id: string
  readonly description: string
  readonly reportedAt: number
  readonly status: 'open' | 'recovered' | 'dismissed'
}

export const RECOVERY_STORAGE_KEY = 'dsh-ice-tools.recovery.v1'

function safeStorage(): Storage | undefined {
  const g = (typeof globalThis !== 'undefined' ? globalThis : undefined) as
    | { localStorage?: Storage; window?: { localStorage?: Storage } }
    | undefined
  return g?.window?.localStorage ?? g?.localStorage
}

function parseEntry(value: unknown): FailedSession | undefined {
  if (typeof value !== 'object' || value === null) return undefined
  const candidate = value as Record<string, unknown>
  if (typeof candidate.id !== 'string') return undefined
  if (typeof candidate.description !== 'string') return undefined
  if (typeof candidate.reportedAt !== 'number') return undefined
  const status = candidate.status
  if (status !== 'open' && status !== 'recovered' && status !== 'dismissed') return undefined
  return {
    id: candidate.id,
    description: candidate.description,
    reportedAt: candidate.reportedAt,
    status,
  }
}

export function loadFailedSessions(): readonly FailedSession[] {
  const store = safeStorage()
  if (store === undefined) return []
  const raw = store.getItem(RECOVERY_STORAGE_KEY)
  if (raw === null) return []
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    const entries: FailedSession[] = []
    for (const item of parsed) {
      const entry = parseEntry(item)
      if (entry !== undefined) entries.push(entry)
    }
    return entries
  } catch {
    return []
  }
}

function persist(entries: readonly FailedSession[]): void {
  const store = safeStorage()
  if (store === undefined) return
  try {
    store.setItem(RECOVERY_STORAGE_KEY, JSON.stringify(entries))
  } catch {
    // localStorage may be disabled or quota-exceeded; the in-memory list
    // still works for the rest of this session.
  }
}

export function addFailedSession(
  entries: readonly FailedSession[],
  id: string,
  description: string,
): readonly FailedSession[] {
  const trimmedId = id.trim()
  const trimmedDesc = description.trim()
  if (trimmedId.length === 0 || trimmedDesc.length === 0) return entries
  // Dedupe on id: a repeat report updates the description and bumps the
  // timestamp rather than growing the list with the same session id.
  const next: FailedSession = {
    id: trimmedId,
    description: trimmedDesc,
    reportedAt: Date.now(),
    status: 'open',
  }
  const updated = [next, ...entries.filter((entry) => entry.id !== trimmedId)]
  persist(updated)
  return updated
}

export function markFailedSession(
  entries: readonly FailedSession[],
  id: string,
  status: FailedSession['status'],
): readonly FailedSession[] {
  const updated = entries.map((entry) => entry.id === id ? { ...entry, status } : entry)
  persist(updated)
  return updated
}

export function removeFailedSession(
  entries: readonly FailedSession[],
  id: string,
): readonly FailedSession[] {
  const updated = entries.filter((entry) => entry.id !== id)
  persist(updated)
  return updated
}

export function clearFailedSessions(): readonly FailedSession[] {
  persist([])
  return []
}

export function exportRecoveryJson(entries: readonly FailedSession[]): string {
  return JSON.stringify(entries, null, 2)
}

export function importRecoveryJson(raw: string): readonly FailedSession[] | string {
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return 'invalid recovery log: not an array'
    const entries: FailedSession[] = []
    for (const item of parsed) {
      const entry = parseEntry(item)
      if (entry === undefined) return 'invalid recovery log: malformed entry'
      entries.push(entry)
    }
    return entries
  } catch (error) {
    return `invalid recovery log: ${error instanceof Error ? error.message : String(error)}`
  }
}

/** Sort by status (open first), then by reportedAt descending. */
export function sortFailedSessions(entries: readonly FailedSession[]): readonly FailedSession[] {
  const order: Record<FailedSession['status'], number> = { open: 0, recovered: 1, dismissed: 2 }
  return entries.slice().sort((a, b) => {
    const pa = order[a.status]
    const pb = order[b.status]
    if (pa !== pb) return pa - pb
    return b.reportedAt - a.reportedAt
  })
}