import type { Context } from '@deepseek-ai/cordis'
import type { Disposer } from './core/dsh-adapter/index.ts'
import { apply as applySettingsHub } from './modules/settings-hub/index.ts'

export const name = 'dsh-ice-tools'
export const stubOnly = false
export const inject = ['settings'] as const

/**
 * Host-side apply: registers the `ice-tools` settings namespace and nothing
 * else. Optional modules previously lived behind a runtime dispatch service;
 * that layer has been removed. Each module's host apply is now registered
 * unconditionally when its module page exists (currently only settingsHub),
 * and optional UI toggles are gated by the settings scope on the client.
 */
export function apply(ctx: Context): void {
  const settingsDisposer = applySettingsHub(ctx)
  // Locale dictionaries are owned by the client half: see src/client/index.ts.
  // The host fiber has no `locale` service, and the only consumer of the i18n
  // copy is the settings UI rendered in the browser.
  ctx.effect((): Disposer => settingsDisposer, 'dsh-ice-tools host cleanup')
}
