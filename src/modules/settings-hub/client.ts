import type { IceContext, ReactElementLike } from '../../core/dsh-adapter/index.ts'
import { DEFAULT_ENABLED, MODULE_NAMES, type EnabledModules, type ModuleName } from '../../core/dispatch/index.ts'
import { en } from '../../i18n/en.ts'
import { zh } from '../../i18n/zh.ts'

export interface SettingsToggle {
  readonly id: ModuleName
  readonly label: { readonly zh: string; readonly en: string }
  readonly description: { readonly zh: string; readonly en: string }
  readonly enabled: boolean
  readonly disabled: boolean
  readonly subSettingsUrl: string
}

export interface SettingsCardProps {
  readonly enabled?: Partial<EnabledModules>
  readonly onToggle?: (name: ModuleName, enabled: boolean) => void
  readonly onOpenSubSettings?: (name: ModuleName) => void
}

export function enableSettingsCard(props: SettingsCardProps = {}): SettingsToggle[] {
  const enabled = { ...DEFAULT_ENABLED, ...props.enabled }
  return MODULE_NAMES.map((id) => ({
    id,
    label: { zh: zh.modules[id].label, en: en.modules[id].label },
    description: { zh: zh.modules[id].description, en: en.modules[id].description },
    enabled: enabled[id],
    disabled: id === 'settingsHub',
    subSettingsUrl: `/settings/ice-tools/${id}`,
  }))
}

export function renderSettingsCard(props: SettingsCardProps = {}): ReactElementLike {
  const toggles = enableSettingsCard(props)
  return {
    type: 'ice-tools-settings-card',
    props: {
      'data-dsh-plugin': 'ice-tools',
      'data-dsh-part': 'settings-card',
      title: { zh: 'ICE 工具', en: 'ICE Tools' },
      toggles,
      onToggle: props.onToggle,
      onOpenSubSettings: props.onOpenSubSettings,
    },
  }
}

/** Browser mount shim; DSH can render the returned element or register it in the settings slot. */
export function mount(ctx: IceContext): ReactElementLike {
  const service = ctx.services?.iceToolsDispatch
  const card = renderSettingsCard({
    enabled: service?.readEnabled?.() as Partial<EnabledModules> | undefined,
    onToggle: (name, enabled) => service?.setEnabled?.(name, enabled),
  })
  ctx.slots?.settings?.register?.(card)
  return card
}
