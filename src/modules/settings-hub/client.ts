import { createElement, useEffect, useState, type CSSProperties, type ReactElement } from 'react'
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type { Disposer, ReactElementLike, SettingsScope } from '../../core/dsh-adapter/index.ts'
import { DEFAULT_ENABLED, MODULE_NAMES, normalizeEnabled, type EnabledModules, type IceConfig, type ModuleName } from '../../core/dispatch/index.ts'
import { runDoctor, type DoctorRun } from '../doctor/client.ts'
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

/** Minimal SettingsScope face consumed by the section component. */
interface SettingsScopeLike {
  getSnapshot(): { readonly value: IceConfig | undefined; readonly writable: boolean }
  subscribe(listener: () => void): () => void
  /** Mutate one field inside the namespace section (path: [field]). */
  set(field: string, value: unknown): Promise<void>
  /** Clear one field so it re-inherits the composition layer. */
  unset(field: string): Promise<void>
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
  scope: SettingsScopeLike
  /** Live locale runtime for bilingual copy. */
  locale: LocaleRuntimeLike
  /** Owning client context; exposed so the doctor button can probe the runtime. */
  ctx?: ClientContext
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

const buttonStyle: CSSProperties = {
  alignSelf: 'flex-start',
  padding: '6px 12px',
  borderRadius: '8px',
  border: '1px solid var(--dsw-alias-border, #ccc)',
  background: 'var(--dsw-alias-bg-elevated, #f5f5f5)',
  cursor: 'pointer',
  fontSize: '13px',
}

const checkRowStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '20px 1fr auto',
  gap: '8px',
  padding: '6px 10px',
  borderRadius: '8px',
  background: 'var(--dsw-alias-bg-row, rgba(127,127,127,0.05))',
  alignItems: 'center',
}

const checkPassStyle: CSSProperties = {
  color: 'var(--dsw-alias-success, #0a7d2c)',
  fontWeight: 600,
}

const checkFailStyle: CSSProperties = {
  color: 'var(--dsw-alias-danger, #b42318)',
  fontWeight: 600,
}

const noteStyle: CSSProperties = {
  color: 'var(--dsw-alias-label-secondary, #666)',
  fontSize: '12px',
  lineHeight: '18px',
}

/**
 * The ICE Tools settings page: one toggle row per module. Enabled state is
 * read from and written to the host-registered `ice-tools` settings namespace
 * through the injected settings scope, so toggles survive reloads.
 */
function IceToolsSection(props: IceToolsSectionProps): ReactElement {
  const { scope, locale, ctx } = props
  const [settings, setSettings] = useState(() => scope.getSnapshot())
  const [localeSnapshot, setLocaleSnapshot] = useState(() => locale.getSnapshot())
  const [doctorRun, setDoctorRun] = useState<DoctorRun | undefined>(undefined)
  const [doctorRunning, setDoctorRunning] = useState(false)
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
    // Path op on the `enabled` field: replace the dict with the next merged
    // value. The controller turns this into a settings.mutate call against
    // the host namespace; the provider validates the section through our
    // schemastery schema (which permits a permissive dict of booleans under
    // `enabled`). Locking `settingsHub: true` on every write keeps that row
    // non-toggleable regardless of any cached state.
    void scope.set('enabled', { ...enabled, settingsHub: true, [name]: next })
  }

  const onRunDoctor = (): void => {
    if (ctx === undefined || doctorRunning) return
    setDoctorRunning(true)
    void runDoctor(ctx).then((result) => {
      setDoctorRun(result)
      setDoctorRunning(false)
    })
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

  const doctorBlock = createElement('div', {
    key: 'doctor',
    style: { display: 'flex', flexDirection: 'column', gap: '8px', padding: '8px 0' },
  },
    createElement('div', { style: { display: 'flex', gap: '8px', alignItems: 'center' } },
      createElement('span', { style: { fontWeight: 600 } }, dict.doctor.title),
      createElement('button', {
        type: 'button',
        style: buttonStyle,
        onClick: onRunDoctor,
        disabled: doctorRunning || ctx === undefined,
        'data-dsh-plugin': 'ice-tools',
        'data-dsh-part': 'doctor-run',
      }, doctorRunning ? dict.doctor.running : dict.doctor.runButton),
    ),
    doctorRun === undefined
      ? createElement('span', { style: noteStyle }, doctorRunning ? dict.doctor.running : '')
      : createElement('div', {
        style: { display: 'flex', flexDirection: 'column', gap: '4px' },
        'data-dsh-plugin': 'ice-tools',
        'data-dsh-part': 'doctor-results',
      },
        doctorRun.results.map((r) =>
          createElement('div', {
            key: r.key,
            style: checkRowStyle,
            'data-dsh-check': r.key,
            'data-dsh-pass': r.pass ? 'true' : 'false',
          },
            createElement('span', { style: r.pass ? checkPassStyle : checkFailStyle }, r.pass ? '✓' : '✗'),
            createElement('div', { style: { display: 'flex', flexDirection: 'column' } },
              createElement('span', { style: { fontSize: '13px' } }, dict.doctor.checks[r.key].label),
              createElement('span', { style: noteStyle }, r.note),
            ),
            createElement('span', { style: { fontSize: '12px' } },
              r.pass ? dict.doctor.pass : dict.doctor.fail,
            ),
          ),
        ),
      ),
  )

  return createElement('section', { 'data-dsh-plugin': 'ice-tools', style: sectionStyle }, rows, doctorBlock)
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
  const injected = () => ({ scope, locale, ctx })
  // The 'settings.section' slot accepts a list of entries. We register one
  // with a deterministic id so the ICE Tools page appears alongside the
  // built-in sections. `priority` lets us shadow any prior registrant at the
  // same id and `order` controls where the entry sits in the rendered list.
  ctx.slots.inject('settings.section', () =>
    ctx.slots.register(
      {
        name: 'settings.section',
        id: 'ice-tools',
        priority: 100,
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
