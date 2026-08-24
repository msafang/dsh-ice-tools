import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type { Disposer } from '../core/dsh-adapter/index.ts'
import {
  DEFAULT_ENABLED,
  MODULE_NAMES,
  normalizeEnabled,
  type EnabledModules,
  type IceConfig,
  type ModuleName,
} from '../core/dispatch/index.ts'
import { en } from '../i18n/en.ts'
import { zh } from '../i18n/zh.ts'
import { mount as mountSettingsHub } from '../modules/settings-hub/client.ts'

export const inject = ['slots', 'locale', 'settingsScope', 'connection'] as const

type ClientMount = (ctx: ClientContext) => void | Disposer

/**
 * Client mounts for the optional modules. Modules without a `mount` yet are
 * stubs; they are listed here so that toggling their enable key takes effect
 * the next time the settings scope publishes.
 */
const CLIENT_MOUNTS: Partial<Record<ModuleName, ClientMount>> = {
  settingsHub: mountSettingsHub,
}

function disposeAll(disposers: readonly Disposer[]): void {
  for (let index = disposers.length - 1; index >= 0; index -= 1) disposers[index]()
}

/**
 * Minimal, untyped `locale.register` shape so the client bundle stays free of
 * `@deepseek-ai/*` runtime imports. The LocaleRuntime defined in
 * `@deepseek-ai/dsh-client-locale/client` exposes the typed `register`; the
 * runtime contract is `register(namespace, { zh, en }) -> disposer`.
 */
interface LocaleRegister {
  register(namespace: string, dictionaries: { readonly zh: unknown; readonly en: unknown }): () => void
}

interface SettingsScopeLike {
  getSnapshot(): { readonly value: IceConfig | undefined }
  subscribe(listener: () => void): () => void
}

export function apply(ctx: ClientContext): void {
  // Register the bilingual dictionaries first so module-level mounts that ask
  // for translation keys can resolve them on first render. The disposer is
  // owned by ctx.effect, so it fires when the client fiber disposes.
  ctx.effect(() => {
    const locale = (ctx as unknown as { locale?: LocaleRegister }).locale
    const disposer = locale?.register('ice-tools', { zh, en })
    return typeof disposer === 'function' ? disposer : undefined
  }, 'dsh-ice-tools client locale register')

  // Mount modules based on the settings scope. The scope is durable; every
  // change to `enabled.<module>` re-drives this effect through the subscriber.
  ctx.effect(() => {
    const scope = (ctx as unknown as { settingsScope: { bind(spec: { namespace: string; decode(s: unknown): IceConfig | undefined }): SettingsScopeLike } }).settingsScope
    const bound = scope.bind({
      namespace: 'ice-tools',
      decode: (section: unknown): IceConfig | undefined => {
        if (typeof section !== 'object' || section === null) return undefined
        return { enabled: normalizeEnabled((section as Partial<IceConfig>).enabled) }
      },
    })

    let disposers: Disposer[] = []
    const remount = (): void => {
      disposeAll(disposers)
      const next: EnabledModules = { ...DEFAULT_ENABLED, ...(bound.getSnapshot().value?.enabled ?? {}) }
      const fresh: Disposer[] = []
      for (const name of MODULE_NAMES) {
        if (!next[name]) continue
        const mount = CLIENT_MOUNTS[name]
        if (mount === undefined) continue
        const disposer = mount(ctx)
        if (typeof disposer === 'function') fresh.push(disposer)
      }
      disposers = fresh
    }

    remount()
    const off = bound.subscribe(remount)
    return () => {
      off()
      disposeAll(disposers)
    }
  }, 'dsh-ice-tools client mounts')
}

export { enableSettingsCard, renderSettingsCard } from '../modules/settings-hub/client.ts'
