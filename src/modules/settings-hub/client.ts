import { createElement, useEffect, useState, type CSSProperties, type ReactElement } from 'react'
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type { Disposer, ReactElementLike, SettingsScope } from '../../core/dsh-adapter/index.ts'
import { DEFAULT_ENABLED, MODULE_NAMES, normalizeEnabled, type EnabledModules, type IceConfig, type ModuleName } from '../../core/dispatch/index.ts'
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

/** Minimal LocaleRuntime face consumed by the section component. */
interface LocaleRuntimeLike {
  getSnapshot(): { readonly active: string; readonly revision: number }
  subscribe(listener: () => void): () => void
}

function dictFor(active: string): typeof zh {
  return active === 'zh' ? zh : en
}

function labelFor(active: string, id: ModuleName): string {
  return dictFor(active).modules[id].label
}

interface IceToolsSectionProps {
  /** Shell affordance: close the settings panel. */
  close?: () => void
  /** Settings-scope bound to the host-registered `ice-tools` namespace. */
  scope: SettingsScope<IceConfig>
  /** Live locale runtime for bilingual copy. */
  locale: LocaleRuntimeLike
}

const sectionStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  padding: '4px 0',
}

const rowStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  padding: '8px 10px',
  borderRadius: '10px',
  cursor: 'pointer',
}

const labelStyle: CSSProperties = {
  fontWeight: 500,
  fontSize: '14px',
  lineHeight: '22px',
  minWidth: '120px',
}

const descStyle: CSSProperties = {
  color: 'var(--dsw-alias-label-secondary, #666)',
  fontSize: '13px',
  lineHeight: '20px',
}

/**
 * The ICE Tools settings page: one toggle row per module. Enabled state is
 * read from and written to the host-registered `ice-tools` settings namespace
 * through the injected settings scope, so toggles survive reloads.
 */
function IceToolsSection(props: IceToolsSectionProps): ReactElement {
  const { scope, locale } = props
  const [settings, setSettings] = useState(() => scope.getSnapshot())
  const [localeSnapshot, setLocaleSnapshot] = useState(() => locale.getSnapshot())
  useEffect(() => {
    const offSettings = scope.subscribe(() => setSettings(scope.getSnapshot()))
    const offLocale = locale.subscribe(() => setLocaleSnapshot(locale.getSnapshot()))
    return () => {
      offSettings()
      offLocale()
    }
  }, [scope, locale])
  const dict = dictFor(localeSnapshot.active)
  const enabled: EnabledModules = { ...DEFAULT_ENABLED, ...(settings.value?.enabled ?? {}) }
  const writable = settings.writable

  const toggle = (name: ModuleName, next: boolean): void => {
    void scope.set('enabled', { ...enabled, settingsHub: true, [name]: next })
  }

  const rows = MODULE_NAMES.map((id) =>
    createElement('label', {
      key: id,
      style: rowStyle,
      'data-dsh-plugin': 'ice-tools',
      'data-dsh-part': 'settings-row',
      'data-module': id,
    },
      createElement('input', {
        type: 'checkbox',
        checked: enabled[id],
        disabled: id === 'settingsHub' || !writable,
        onChange: (event: { target: { checked: boolean } }) => toggle(id, event.target.checked),
      }),
      createElement('span', { style: labelStyle }, dict.modules[id].label),
      createElement('span', { style: descStyle }, dict.modules[id].description),
    ),
  )

  return createElement('section', { 'data-dsh-plugin': 'ice-tools', style: sectionStyle }, rows)
}

/**
 * Register the ICE Tools settings page in the canonical `settings.section`
 * slot, which the settings shell projects into its navigation and content
 * column. The `ice-tools` locale namespace is registered exactly once by the
 * client fiber's apply() (src/client/index.ts).
 */
export function mount(ctx: ClientContext): Disposer {
  // `decode` normalizes the wire section so the scope never needs the host's
  // schema envelope (a callable schema is not rehydratable client-side).
  const scope = ctx.settingsScope.bind<IceConfig>({
    namespace: 'ice-tools',
    decode: (section: unknown): IceConfig | undefined => {
      if (typeof section !== 'object' || section === null) return undefined
      return { enabled: normalizeEnabled((section as Partial<IceConfig>).enabled) }
    },
  })
  const locale = ctx.locale as unknown as LocaleRuntimeLike
  const injected = () => ({ scope, locale })
  // The 'settings.section' slot accepts a list of entries. We register one
  // with a deterministic id and an order so the ICE Tools page appears
  // alongside the built-in sections.
  ctx.slots.inject('settings.section', () =>
    ctx.slots.register(
      {
        name: 'settings.section',
        id: 'ice-tools',
        order: 10,
        label: () => labelFor(locale.getSnapshot().active, 'settingsHub'),
        inject: injected,
      },
      IceToolsSection,
    ),
  )
  return () => {
    // Slot registration is fiber-scoped; nothing else to tear down here.
  }
}
