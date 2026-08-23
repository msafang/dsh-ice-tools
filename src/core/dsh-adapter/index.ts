import type { Context } from '@deepseek-ai/cordis'
import type { ClientContext, SettingsScope } from '@deepseek-ai/dsh-client-runtime/client'

export type Disposer = () => void

/** Host-side Cordis context. */
export type HostContext = Context

/** Client-side Cordis context with Web GUI extensions. */
export type ClientIceContext = ClientContext

/** Union type for code that runs in both halves. */
export type IceContext = HostContext | ClientIceContext

export type { SettingsScope }

export interface SettingsLabel {
  readonly zh: string
  readonly en: string
}

export interface ReactElementLike {
  readonly type: string
  readonly props: Readonly<Record<string, unknown>>
}

/** Minimal schema boundary needed by the injected settings service. */
export type SettingsSchema<T> = unknown

export interface SettingsSectionHooks<T> {
  readonly setSource?: (source: () => T) => void
  readonly onChange?: () => void
}

export interface SettingsService {
  readonly installSettingsSection?: <T>(
    ctx: HostContext,
    namespace: string,
    schema: SettingsSchema<T>,
    defaults: T,
    hooks: SettingsSectionHooks<T>,
  ) => void | Disposer
}

export interface SettingsScopeBinder {
  bind<T>(spec: { readonly namespace: string; readonly decode?: (section: unknown) => T | undefined }): SettingsScope<T>
}

export interface LocaleService {
  readonly register: (namespace: string, dictionaries: { readonly zh: unknown; readonly en: unknown }) => void | Disposer
}

export interface DispatchClientService {
  readonly readEnabled?: () => Readonly<Record<string, boolean>>
  readonly setEnabled?: (name: string, enabled: boolean) => void
  readonly tick?: () => unknown
}

/**
 * Keep the public helper's argument order identical to upstream settings
 * registration while resolving the provider through Cordis.
 */
export function installSettingsSection<T>(
  ctx: HostContext,
  namespace: string,
  schema: SettingsSchema<T>,
  defaults: T,
  hooks: SettingsSectionHooks<T>,
): Disposer {
  const settings = ctx.get('settings') as SettingsService | undefined
  const disposer = settings?.installSettingsSection?.(ctx, namespace, schema, defaults, hooks)
  return typeof disposer === 'function' ? disposer : () => {}
}
