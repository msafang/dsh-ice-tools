import type { IceContext } from '../dsh-adapter/index.ts'

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
export type OptionalModuleName = Exclude<ModuleName, 'settingsHub'>
export const OPTIONAL_MODULE_NAMES = MODULE_NAMES.filter(
  (name): name is OptionalModuleName => name !== 'settingsHub',
)

export type EnabledModules = Record<ModuleName, boolean>
export type OptionalDispatchResult = Record<OptionalModuleName, 'apply' | 'skipped'>
export type ModuleApplier = (ctx: IceContext) => void
export type ModuleAppliers = Record<OptionalModuleName, ModuleApplier>

export interface IceConfig {
  readonly enabled: EnabledModules
}

export interface ConfigSource {
  read(): IceConfig
  setEnabled(name: ModuleName, enabled: boolean): IceConfig
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

/**
 * Mount only the optional modules enabled for this tick. settingsHub is
 * mounted separately by the host entry and is therefore not in this result.
 */
export function mount(
  ctx: IceContext,
  enabled: Partial<Record<ModuleName, boolean>>,
  appliers: ModuleAppliers,
): OptionalDispatchResult {
  const result = {} as OptionalDispatchResult
  for (const name of OPTIONAL_MODULE_NAMES) {
    if (enabled[name] === true) {
      appliers[name](ctx)
      result[name] = 'apply'
    } else {
      result[name] = 'skipped'
    }
  }
  return result
}

/**
 * Host-side service wrapper. The file-backed source is injected so this core
 * module stays browser-safe when its metadata is imported by the client half.
 */
export function createDispatchService(
  ctx: IceContext,
  source: ConfigSource,
  appliers: ModuleAppliers,
) {
  const service = {
    readEnabled: () => source.read().enabled,
    setEnabled: (name: ModuleName, enabled: boolean) => {
      source.setEnabled(name, enabled)
    },
    mount: () => mount(ctx, source.read().enabled, appliers),
    tick: () => mount(ctx, source.read().enabled, appliers),
  }
  return service
}
