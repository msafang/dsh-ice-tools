/**
 * Module identity and default enable state. This file used to also host a
 * dispatch service that gated optional module mounts behind a runtime
 * file-backed toggle. That layer has been removed: module mounting is now
 * driven by the `ice-tools` settings scope on the client, and the host half
 * only registers the settings namespace itself.
 */

export const MODULE_NAMES = [
  'settingsHub',
  'pluginManager',
  'chatRecovery',
  'desktopLauncher',
  'doctor',
  'sessionId',
  'skillExplorer',
  'gitGraph',
  'taskBoard',
] as const

export type ModuleName = (typeof MODULE_NAMES)[number]

export type EnabledModules = Record<ModuleName, boolean>

export interface IceConfig {
  readonly enabled: EnabledModules
}

/**
 * Defaults for the toggle surface. Two utilities are flipped on by default
 * because they are useful on every ICE Tools visit: the doctor checks the
 * runtime and the session list gives the user an immediate handle on the
 * current session id. The other six are off until the user opts in — they
 * reach for niche utilities (skill catalogue, patch browser, git graph,
 * task list, recovery log) and the empty state already hints at them.
 */
export const DEFAULT_ENABLED: EnabledModules = {
  settingsHub: true,
  pluginManager: false,
  chatRecovery: false,
  desktopLauncher: false,
  doctor: true,
  sessionId: true,
  skillExplorer: false,
  gitGraph: false,
  taskBoard: false,
}

export function normalizeEnabled(value: Partial<Record<ModuleName, unknown>> | undefined): EnabledModules {
  const normalized = { ...DEFAULT_ENABLED }
  for (const name of MODULE_NAMES) {
    if (typeof value?.[name] === 'boolean') normalized[name] = value[name] as boolean
  }
  normalized.settingsHub = true
  return normalized
}
