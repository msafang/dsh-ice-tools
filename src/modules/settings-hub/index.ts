import type { HostContext, SettingsSchema } from '../../core/dsh-adapter/index.ts'
import { installSettingsSection } from '../../core/dsh-adapter/index.ts'
import { DEFAULT_ENABLED, type IceConfig } from '../../core/dispatch/index.ts'

export const name = 'ice-settings-hub'
export const stubOnly = false
export const descriptionKey = 'modules.settingsHub.description'

/** The settings schema is intentionally kept at the injected adapter boundary. */
export const Config: SettingsSchema<IceConfig> = {
  type: 'object',
  properties: {
    enabled: { type: 'object' },
  },
}

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
