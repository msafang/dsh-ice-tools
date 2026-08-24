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

export const DEFAULT_ENABLED: EnabledModules = {
  settingsHub: true,
  pluginManager: false,
  chatRecovery: false,
  desktopLauncher: false,
  doctor: false,
  sessionId: false,
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
