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

export interface LauncherState {
  readonly url: string
}

export interface LauncherResult {
  readonly ok: boolean
  readonly message: string
}

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