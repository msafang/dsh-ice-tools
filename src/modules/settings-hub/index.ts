import type { HostContext, SettingsSchema } from '../../core/dsh-adapter/index.ts'
import { installSettingsSection } from '../../core/dsh-adapter/index.ts'
import { DEFAULT_ENABLED, normalizeEnabled, type IceConfig } from '../../core/dispatch/index.ts'

export const name = 'ice-settings-hub'
export const stubOnly = false
export const descriptionKey = 'modules.settingsHub.description'

/**
 * Callable settings schema. The DSH settings provider resolves a namespace by
 * invoking the schema with the merged `base` + user layer, so the schema must
 * be a function returning the normalized section (a plain object would not be
 * callable and the registration would fail at resolve time). The provider's
 * `describe` also serializes the schema envelope through `toJSON`; the client
 * never rehydrates it (it binds with a `decode`), so a minimal envelope is
 * enough for the wire view.
 */
export type IceToolsSchema = SettingsSchema<IceConfig> & { toJSON(): unknown }

export const Config: IceToolsSchema = Object.assign(
  (value: unknown): IceConfig => {
    const section = (value ?? {}) as Partial<IceConfig>
    return { enabled: normalizeEnabled(section.enabled) }
  },
  { toJSON: () => ({ type: 'object', props: {} }) },
)

export const defaults: IceConfig = {
  enabled: { ...DEFAULT_ENABLED },
}

/** Register the top-level bilingual settings section and return its disposer. */
export function apply(ctx: HostContext): () => void {
  let source = () => defaults
  return installSettingsSection(ctx, 'ice-tools', Config, defaults, {
    setSource: (current) => {
      source = current
    },
    onChange: () => {
      void source()
    },
  })
}
