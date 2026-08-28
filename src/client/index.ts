import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type { Disposer } from '../core/dsh-adapter/index.ts'
import { readOptionalClient, type LocaleRegister } from '../core/dsh-adapter/index.ts'
import { en } from '../i18n/en.ts'
import { zh } from '../i18n/zh.ts'
import { mount as mountSettingsHub } from '../modules/settings-hub/client.ts'

export const inject = ['slots', 'locale', 'settingsScope', 'connection'] as const

export function apply(ctx: ClientContext): void {
  // Register the bilingual dictionaries once. The disposer is owned by
  // ctx.effect, so it fires when the client fiber disposes.
  ctx.effect(() => {
    const locale = readOptionalClient<LocaleRegister>(ctx, 'locale')
    const disposer = locale?.register('ice-tools', { zh, en })
    return typeof disposer === 'function' ? disposer : undefined
  }, 'dsh-ice-tools client locale register')

  // Mount the settings hub exactly once. The hub is fiber-scoped: slot
  // registrations created through `ctx.slots.inject` / `ctx.slots.register`
  // belong to the current client fiber and are released when the fiber
  // disposes — there is no per-mount disposer. Calling `mountSettingsHub`
  // again would re-register the same slot id and throw. The React section
  // component subscribes to the settings scope on its own, so subsequent
  // toggles re-render without remounting the slot.
  const settingsHubDisposer: Disposer | undefined = mountSettingsHub(ctx)
  if (typeof settingsHubDisposer === 'function') {
    ctx.effect(() => settingsHubDisposer, 'dsh-ice-tools settings hub')
  }
}

export { enableSettingsCard, renderSettingsCard } from '../modules/settings-hub/client.ts'