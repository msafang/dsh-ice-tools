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
 * Minimal locale runtime face the plugin reads. The real
 * `LocaleRuntime` lives in @deepseek-ai/dsh-client-locale/client and exposes
 * a much richer contract (subscribe + revision tracking). We declare the
 * minimal subset we actually use so the browser bundle stays free of
 * @deepseek-ai/* runtime imports and so a host that pre-dates the locale
 * package can still boot.
 */
export interface LocaleRuntimeLike {
  getSnapshot(): { readonly active: string; readonly revision: number }
  subscribe(listener: () => void): () => void
}

/**
 * Minimal locale register face the client applies once per fiber. The real
 * LocaleRuntime.register accepts (namespace, { zh, en }) and returns a
 * disposer; we mirror that contract here so the registration is cheap to
 * stub out in tests.
 */
export interface LocaleRegister {
  register(namespace: string, dictionaries: { readonly zh: unknown; readonly en: unknown }): () => void
}

/**
 * Narrow face over `ctx.settingsScope` when the caller binds a scope that
 * does not need write access. Read-only callers (skillExplorer mirror) use
 * this shape so the boundary stays honest without exposing the writable
 * fields.
 */
export interface ReadOnlySettingsScope<T> {
  getSnapshot(): { readonly value: T | undefined }
  subscribe(listener: () => void): () => void
}

/**
 * Minimal settings scope face the section component uses to read and write
 * the ice-tools enabled map. Same contract as @deepseek-ai/dsh-client-
 * runtime's SettingsScope but without the upstream dependency.
 */
export interface SettingsScopeLike<T> {
  getSnapshot(): { readonly value: T | undefined; readonly writable: boolean }
  subscribe(listener: () => void): () => void
  set(field: string, value: unknown): Promise<void>
  unset(field: string): Promise<void>
}

/**
 * Read a Cordis service through ctx.get without tripping the host's
 * "service is not injected" guard. The helper centralises the cast so the
 * call sites stay readable; the consumer takes responsibility for typing the
 * returned value narrowly enough that the rest of the plugin typechecks.
 */
export function readOptional<T>(ctx: HostContext, name: string): T | undefined {
  return ctx.get(name) as T | undefined
}

/**
 * Same as readOptional but works against the client runtime as well as the
 * host. The signature is identical because both sides share the Cordis
 * Context contract; the helper exists so a single import path covers both
 * halves without needing a discriminant.
 */
export function readOptionalClient<T>(ctx: unknown, name: string): T | undefined {
  return (ctx as { get(name: string): unknown }).get(name) as T | undefined
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
  const settings = readOptional<SettingsService>(ctx, 'settings')
  const scope = settings?.register?.(namespace, schema, { base: defaults })
  if (scope === void 0) return () => {}
  hooks.setSource?.(() => scope.get())
  hooks.onChange?.()
  const offWatch = scope.watch(() => hooks.onChange?.())
  return () => {
    if (typeof offWatch === 'function') offWatch()
  }
}
