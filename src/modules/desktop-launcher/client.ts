/**
 * desktopLauncher: tiny client-only URL handoff. The ICE Tools page exposes
 * an input + "Open" button; pressing Open copies the URL to the clipboard
 * and surfaces a "use the system browser" hint so the user knows the launch
 * itself is intentionally outside the plugin (the browser security model
 * disallows window.open from plugins without a gesture match, and a real
 * cross-process launcher would require a host service + permission grant).
 *
 * A future revision can wire this to a Host subprocess service once the
 * permissions seam is available; the public surface here stays the same.
 */

export type UrlScheme = 'http' | 'https' | 'mailto' | 'other'

export interface LauncherState {
  readonly url: string
}

export interface LauncherResult {
  readonly ok: boolean
  readonly message: string
}

export interface UrlHistoryEntry {
  readonly url: string
  readonly scheme: UrlScheme
  readonly usedAt: number
}

export interface QuickPreset {
  readonly id: string
  readonly label: { readonly en: string; readonly zh: string }
  readonly scheme: UrlScheme
  readonly placeholder: string
}

const HISTORY_KEY = 'dsh-ice-tools.launcher.history.v1'
const HISTORY_LIMIT = 10

export const QUICK_PRESETS: readonly QuickPreset[] = [
  {
    id: 'github-issue',
    scheme: 'https',
    label: { en: 'GitHub issue', zh: 'GitHub Issue' },
    placeholder: 'https://github.com/owner/repo/issues/123',
  },
  {
    id: 'github-pr',
    scheme: 'https',
    label: { en: 'GitHub PR', zh: 'GitHub PR' },
    placeholder: 'https://github.com/owner/repo/pull/456',
  },
  {
    id: 'github-commit',
    scheme: 'https',
    label: { en: 'GitHub commit', zh: 'GitHub commit' },
    placeholder: 'https://github.com/owner/repo/commit/abc123',
  },
  {
    id: 'mailto',
    scheme: 'mailto',
    label: { en: 'Email', zh: '邮件' },
    placeholder: 'mailto:someone@example.com?subject=...',
  },
]

/**
 * Validate a URL string enough that we can copy it confidently. We accept
 * http(s) and mailto schemes; everything else (javascript:, file:, data:)
 * is rejected so the user does not accidentally ship a clipboard payload
 * that an external program would execute.
 */
export function isLaunchableUrl(raw: string): boolean {
  const trimmed = raw.trim()
  if (trimmed.length === 0) return false
  if (trimmed.startsWith('https://') || trimmed.startsWith('http://')) return true
  if (trimmed.startsWith('mailto:')) return true
  return false
}

/** Detect the URL scheme without depending on the URL constructor. */
export function schemeOf(raw: string): UrlScheme {
  const trimmed = raw.trim().toLowerCase()
  if (trimmed.startsWith('https://')) return 'https'
  if (trimmed.startsWith('http://')) return 'http'
  if (trimmed.startsWith('mailto:')) return 'mailto'
  return 'other'
}

export async function openOrCopyUrl(raw: string, copy: (text: string) => Promise<{ ok: boolean; message: string }>): Promise<LauncherResult> {
  const trimmed = raw.trim()
  if (!isLaunchableUrl(trimmed)) {
    return { ok: false, message: 'unsupported scheme' }
  }
  // window.open is intentionally not invoked: plugins cannot reliably
  // trigger a new tab from a deferred handler, and the browser will
  // block popup-style launches without a tight user-gesture chain.
  return (await copy(trimmed))
}

function safeStorage(): Storage | undefined {
  if (typeof window === 'undefined' || window.localStorage === undefined) return undefined
  return window.localStorage
}

/**
 * Read the URL history from localStorage. Returns an empty array on any
 * failure (no window, quota, malformed JSON) so the caller can render
 * an empty-state hint without further guarding.
 */
export function loadHistory(): readonly UrlHistoryEntry[] {
  const store = safeStorage()
  if (store === undefined) return []
  const raw = store.getItem(HISTORY_KEY)
  if (raw === null) return []
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    const entries: UrlHistoryEntry[] = []
    for (const item of parsed) {
      if (typeof item !== 'object' || item === null) continue
      const candidate = item as Record<string, unknown>
      if (typeof candidate.url !== 'string') continue
      if (typeof candidate.usedAt !== 'number') continue
      const scheme = candidate.scheme
      if (scheme !== 'http' && scheme !== 'https' && scheme !== 'mailto' && scheme !== 'other') continue
      entries.push({ url: candidate.url, scheme, usedAt: candidate.usedAt })
    }
    return entries
  } catch {
    return []
  }
}

function persistHistory(entries: readonly UrlHistoryEntry[]): void {
  const store = safeStorage()
  if (store === undefined) return
  try {
    store.setItem(HISTORY_KEY, JSON.stringify(entries))
  } catch {
    // localStorage may be disabled or quota-exceeded; the in-memory
    // history still updates for the rest of this session.
  }
}

/**
 * Record a successful URL handoff at the front of the history list.
 * Duplicates collapse (the most recent timestamp wins) and the list is
 * capped at HISTORY_LIMIT entries.
 */
export function recordHistory(entries: readonly UrlHistoryEntry[], url: string): readonly UrlHistoryEntry[] {
  const scheme = schemeOf(url)
  const trimmed = url.trim()
  const filtered = entries.filter((entry) => entry.url !== trimmed)
  const next: UrlHistoryEntry = { url: trimmed, scheme, usedAt: Date.now() }
  const updated = [next, ...filtered].slice(0, HISTORY_LIMIT)
  persistHistory(updated)
  return updated
}

/** Remove a single history entry by URL. */
export function removeHistory(entries: readonly UrlHistoryEntry[], url: string): readonly UrlHistoryEntry[] {
  const updated = entries.filter((entry) => entry.url !== url)
  persistHistory(updated)
  return updated
}

/** Wipe the history. Returns an empty array and clears the storage entry. */
export function clearHistory(): readonly UrlHistoryEntry[] {
  persistHistory([])
  return []
}