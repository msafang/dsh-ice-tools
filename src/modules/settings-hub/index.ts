import type { HostContext } from '../../core/dsh-adapter/index.ts'
import { DEFAULT_ENABLED, normalizeEnabled, type IceConfig } from '../../core/dispatch/index.ts'
import Schema from '@deepseek-ai/schemastery'

export const name = 'ice-settings-hub'
export const stubOnly = false
export const descriptionKey = 'modules.settingsHub.description'

/**
 * The settings schema for the `ice-tools` namespace. Schemastery is the same
 * DSL the upstream SettingsProvider registers against, so the provider can
 * validate writes and serialize via `toJSON()` for the configuration surface.
 *
 * `enabled` is a permissive dict: any module key is accepted with a boolean
 * value. `normalizeEnabled` is the canonical source of truth for the
 * settingsHub lock and missing-key defaults.
 */
export const Config = Schema.object({
  enabled: Schema.dict(Schema.boolean()),
})

export const defaults: IceConfig = {
  enabled: { ...DEFAULT_ENABLED },
}

/** Register the top-level bilingual settings section through the host provider. */
export function apply(ctx: HostContext): () => void {
  // Subscribe to the settings service and register one namespace. The
  // provider's `register` returns an owner scope; we mirror that contract on
  // the typed adapter side and rely on the host to persist the section.
  const settings = ctx.get('settings') as
    | {
        register?<T>(ns: string, schema: unknown, options?: { base?: T }): {
          get(): T
          watch(cb: () => void): () => void
        }
      }
    | undefined

  if (settings?.register === undefined) {
    return () => {}
  }

  const scope = settings.register('ice-tools', Config, { base: defaults })
  // Touch the scope so the host knows the section is live, and reduce on each
  // commit to keep `settingsHub` non-toggleable.
  void scope.get()
  scope.watch(() => {
    const next = scope.get()
    void normalizeEnabled(next.enabled)
  })

  return () => {}
}
