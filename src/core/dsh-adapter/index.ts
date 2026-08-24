import type { Context } from '@deepseek-ai/cordis'
import type { SettingsScope } from '@deepseek-ai/dsh-client-runtime/client'

export type Disposer = () => void

/** Host-side Cordis context. */
export type HostContext = Context

export type { SettingsScope }

export interface SettingsLabel {
  readonly zh: string
  readonly en: string
}

export interface ReactElementLike {
  readonly type: string
  readonly props: Readonly<Record<string, unknown>>
}

/**
 * Minimal schema boundary needed by the injected settings service. The DSH
 * settings provider resolves a namespace by CALLING the schema with the merged
 * layer value, so a plain object is not accepted — pass a callable that
 * returns the normalized section.
 */
export type SettingsSchema<T> = (value: unknown) => T

export interface SettingsSectionHooks<T> {
  readonly setSource?: (source: () => T) => void
  readonly onChange?: () => void
}

/** The owner scope the provider returns from `register`. */
export interface SettingsSectionScope<T> {
  get(): T
  watch(callback: () => void): () => void
}

export interface SettingsService {
  readonly register?: <T>(
    namespace: string,
    schema: SettingsSchema<T>,
    options?: { readonly base?: T },
  ) => SettingsSectionScope<T> | undefined
}

export interface SettingsScopeBinder {
  bind<T>(spec: { readonly namespace: string; readonly decode?: (section: unknown) => T | undefined }): SettingsScope<T>
}

/**
 * Register one settings namespace through the injected host settings service.
 * The provider exposes `register(ns, schema, { base })` (there is no
 * `installSettingsSection` method on the service — that is a standalone
 * helper in @deepseek-ai/dsh-settings), so the wiring mirrors the upstream
 * helper: point the source thunk at the registered scope and forward change
 * notifications through `watch`.
 */
export function installSettingsSection<T>(
  ctx: HostContext,
  namespace: string,
  schema: SettingsSchema<T>,
  defaults: T,
  hooks: SettingsSectionHooks<T>,
): Disposer {
  const settings = ctx.get('settings') as SettingsService | undefined
  const scope = settings?.register?.(namespace, schema, { base: defaults })
  if (scope === void 0) return () => {}
  hooks.setSource?.(() => scope.get())
  hooks.onChange?.()
  const offWatch = scope.watch(() => hooks.onChange?.())
  return () => {
    if (typeof offWatch === 'function') offWatch()
  }
}
