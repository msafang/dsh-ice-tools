import type { IceContext } from '../../core/dsh-adapter/index.ts'
import { installSettingsSection } from '../../core/dsh-adapter/index.ts'

export const name = 'ice-settings-hub'
export const stubOnly = false
export const descriptionKey = 'modules.settingsHub.description'

/** The one implemented module: register the top-level bilingual settings section. */
export function apply(ctx: IceContext): void {
  installSettingsSection(ctx, {
    id: 'ice-tools',
    order: 50,
    label: { zh: 'ICE 工具', en: 'ICE Tools' },
    render: () => import('../../client/index'),
  })
}
