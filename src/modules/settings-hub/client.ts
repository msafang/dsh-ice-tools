import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type {
  Disposer,
  DispatchClientService,
  ReactElementLike,
  SettingsScope,
  SettingsScopeBinder,
} from '../../core/dsh-adapter/index.ts'
import { DEFAULT_ENABLED, MODULE_NAMES, type EnabledModules, type IceConfig, type ModuleName } from '../../core/dispatch/index.ts'
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

function disposeAll(disposers: readonly Disposer[]): void {
  for (let index = disposers.length - 1; index >= 0; index -= 1) disposers[index]()
}

/** Register the settings card in the upstream keyed plugin-item slot. */
export function mount(ctx: ClientContext): Disposer {
  const service = ctx.get('iceToolsDispatch') as DispatchClientService | undefined
  const scope = ctx.settingsScope.bind<IceConfig>({ namespace: 'ice-tools' })
  const configuredEnabled = scope.getSnapshot().value?.enabled
  const card = renderSettingsCard({
    enabled: configuredEnabled ?? (service?.readEnabled?.() as Partial<EnabledModules> | undefined),
    onToggle: (name, enabled) => service?.setEnabled?.(name, enabled),
  })
  const localeDisposer = ctx.locale.register('ice-tools', { zh, en })
  ctx.slots.inject('web-ui.plugin.item' as never, () =>
    ctx.slots.register(
      {
        name: 'web-ui.plugin.item',
        key: 'ice-tools',
        locale: 'ice-tools',
        inject: () => ({ card }),
      } as never,
      (() => card) as never,
    ),
  )

  let disposed = false
  return () => {
    if (disposed) return
    disposed = true
    if (typeof localeDisposer === 'function') localeDisposer()
  }
}
