/**
 * gitGraph: client-only placeholder. Rendering `git log --graph` requires
 * a Host subprocess service the plugin does not currently own (cross-fiber
 * RPC + permission grant), so the ICE Tools page surfaces a static hint
 * explaining how to enable the real implementation. The placeholder keeps
 * the settings toggle useful while leaving room for a Host-side gitGraph
 * service to replace it without changing the settings surface.
 */

export interface GitGraphState {
  readonly status: 'requires-host'
}

export function readGitGraphState(): GitGraphState {
  return { status: 'requires-host' }
}