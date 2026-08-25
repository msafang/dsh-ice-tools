import { createElement, useEffect, useState, type CSSProperties, type ReactElement } from 'react'
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type { Disposer, ReactElementLike, SettingsScope } from '../../core/dsh-adapter/index.ts'
import { DEFAULT_ENABLED, MODULE_NAMES, normalizeEnabled, type EnabledModules, type IceConfig, type ModuleName } from '../../core/dispatch/index.ts'
import { runDoctor, type DoctorRun } from '../doctor/client.ts'
import { KNOWN_SKILLS, type SkillEntry } from '../skill-explorer/client.ts'
import { copyToClipboard, listSessions, type SessionSummary } from '../session-id/client.ts'
import { isLaunchableUrl, openOrCopyUrl } from '../desktop-launcher/client.ts'
import { parseCordisPatch } from '../plugin-manager/client.ts'
import { readGitGraphState } from '../git-graph/client.ts'
import { addTask, loadTasks, removeTask, toggleTask, type Task } from '../task-board/client.ts'
import { readChatRecoveryState } from '../chat-recovery/client.ts'
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

function sessionIdBlock(
  sessions: readonly SessionSummary[],
  sessionsError: string | undefined,
  sessionsRunning: boolean,
  copyFlash: string | undefined,
  sdict: typeof zh.sessionId,
  onRefresh: () => void,
  onCopy: (sessionId: string) => void,
): ReactElement {
  const list = sessionsError !== undefined
    ? createElement('span', { style: noteStyle }, sessionsError)
    : sessions.length === 0
      ? createElement('span', { style: noteStyle }, sdict.empty)
      : createElement('div', {
        style: { display: 'flex', flexDirection: 'column', gap: '4px' },
        'data-dsh-plugin': 'ice-tools',
        'data-dsh-part': 'session-list',
      },
        sessions.map((entry) => {
          const copied = copyFlash === `copied:${entry.sessionId}`
          return createElement('div', {
            key: entry.sessionId,
            style: {
              display: 'grid',
              gridTemplateColumns: '1fr auto auto',
              gap: '8px',
              alignItems: 'center',
              padding: '4px 8px',
              borderRadius: '6px',
              background: 'var(--dsw-alias-bg-row, rgba(127,127,127,0.05))',
            },
            'data-dsh-session-id': entry.sessionId,
          },
            createElement('code', {
              style: {
                fontFamily: 'var(--dsw-alias-font-mono, ui-monospace, monospace)',
                fontSize: '12px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              },
            }, entry.sessionId),
            createElement('span', { style: { fontSize: '12px' } }, entry.running === true ? sdict.running : sdict.idle),
            createElement('button', {
              type: 'button',
              style: { ...buttonStyle, padding: '4px 8px' },
              onClick: () => onCopy(entry.sessionId),
            }, copied ? sdict.copied : sdict.copy),
          )
        }),
        copyFlash === 'failed'
          ? createElement('span', { style: { ...noteStyle, color: 'var(--dsw-alias-danger, #b42318)' } }, sdict.copyFailed)
          : null,
      )
  return createElement('div', {
    key: 'session-id',
    style: { display: 'flex', flexDirection: 'column', gap: '8px', padding: '8px 0' },
    'data-dsh-plugin': 'ice-tools',
    'data-dsh-part': 'session-id',
  },
    createElement('div', { style: { display: 'flex', gap: '8px', alignItems: 'center' } },
      createElement('span', { style: { fontWeight: 600 } }, sdict.title),
      createElement('button', {
        type: 'button',
        style: buttonStyle,
        onClick: onRefresh,
        disabled: sessionsRunning,
        'data-dsh-plugin': 'ice-tools',
        'data-dsh-part': 'session-refresh',
      }, sessionsRunning ? '…' : sdict.refresh),
    ),
    list,
  )
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

  // Each module toggle gates its corresponding utility block. settingsHub
  // itself is non-toggleable; the rest flip on a per-block basis. The
  // frozen-blocks (gitGraph, chatRecovery) keep their "requires host" note
  // intact while only rendering when the user opts in.
  const blockFor = (id: ModuleName, element: ReactElement): ReactElement | null =>
    enabled[id] ? element : null

  return createElement('section', { 'data-dsh-plugin': 'ice-tools', style: sectionStyle },
    rows,
    blockFor('doctor', createElement(DoctorBlock, { key: 'doctor', dict, ctx })),
    blockFor('sessionId', createElement(SessionIdBlock, { key: 'session-id', dict, ctx })),
    blockFor('skillExplorer', createElement(SkillExplorerBlock, { key: 'skill-explorer', dict })),
    blockFor('desktopLauncher', createElement(DesktopLauncherBlock, { key: 'desktop-launcher', dict })),
    blockFor('pluginManager', createElement(PluginManagerBlock, { key: 'plugin-manager', dict })),
    blockFor('gitGraph', createElement(GitGraphBlock, { key: 'git-graph', dict })),
    blockFor('taskBoard', createElement(TaskBoardBlock, { key: 'task-board', dict })),
    blockFor('chatRecovery', createElement(ChatRecoveryBlock, { key: 'chat-recovery', dict })),
  )
}

function DoctorBlock({ dict, ctx }: { readonly dict: typeof zh; readonly ctx: ClientContext | undefined }): ReactElement {
  const sdict = dict.doctor
  const [doctorRun, setDoctorRun] = useState<DoctorRun | undefined>(undefined)
  const [doctorRunning, setDoctorRunning] = useState(false)
  const onRun = (): void => {
    if (ctx === undefined || doctorRunning) return
    setDoctorRunning(true)
    void runDoctor(ctx).then((result) => {
      setDoctorRun(result)
      setDoctorRunning(false)
    })
  }
  return createElement('div', {
    key: 'doctor',
    style: { display: 'flex', flexDirection: 'column', gap: '8px', padding: '8px 0' },
    'data-dsh-plugin': 'ice-tools',
    'data-dsh-part': 'doctor',
  },
    createElement('div', { style: { display: 'flex', gap: '8px', alignItems: 'center' } },
      createElement('span', { style: { fontWeight: 600 } }, sdict.title),
      createElement('button', {
        type: 'button',
        style: buttonStyle,
        onClick: onRun,
        disabled: doctorRunning || ctx === undefined,
        'data-dsh-plugin': 'ice-tools',
        'data-dsh-part': 'doctor-run',
      }, doctorRunning ? sdict.running : sdict.runButton),
    ),
    doctorRun === undefined
      ? createElement('span', { style: noteStyle }, doctorRunning ? sdict.running : '')
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
              createElement('span', { style: { fontSize: '13px' } }, sdict.checks[r.key].label),
              createElement('span', { style: noteStyle }, r.note),
            ),
            createElement('span', { style: { fontSize: '12px' } }, r.pass ? sdict.pass : sdict.fail),
          ),
        ),
      ),
  )
}

function SessionIdBlock({ dict, ctx }: { readonly dict: typeof zh; readonly ctx: ClientContext | undefined }): ReactElement {
  const sdict = dict.sessionId
  const [sessions, setSessions] = useState<readonly SessionSummary[]>([])
  const [sessionsError, setSessionsError] = useState<string | undefined>(undefined)
  const [sessionsRunning, setSessionsRunning] = useState(false)
  const [copyFlash, setCopyFlash] = useState<string | undefined>(undefined)
  const onRefresh = (): void => {
    if (ctx === undefined || sessionsRunning) return
    setSessionsRunning(true)
    void listSessions(ctx).then((result) => {
      setSessions(result.sessions)
      setSessionsError(result.error)
      setSessionsRunning(false)
    })
  }
  const onCopy = (sessionId: string): void => {
    void copyToClipboard(sessionId).then((outcome) => {
      setCopyFlash(outcome.ok ? `copied:${sessionId}` : 'failed')
      if (typeof window !== 'undefined') {
        window.setTimeout(() => setCopyFlash(undefined), 1500)
      }
    })
  }
  const list = sessionsError !== undefined
    ? createElement('span', { style: noteStyle }, sessionsError)
    : sessions.length === 0
      ? createElement('span', { style: noteStyle }, sdict.empty)
      : createElement('div', {
        style: { display: 'flex', flexDirection: 'column', gap: '4px' },
        'data-dsh-plugin': 'ice-tools',
        'data-dsh-part': 'session-list',
      },
        sessions.map((entry) => {
          const copied = copyFlash === `copied:${entry.sessionId}`
          return createElement('div', {
            key: entry.sessionId,
            style: {
              display: 'grid',
              gridTemplateColumns: '1fr auto auto',
              gap: '8px',
              alignItems: 'center',
              padding: '4px 8px',
              borderRadius: '6px',
              background: 'var(--dsw-alias-bg-row, rgba(127,127,127,0.05))',
            },
            'data-dsh-session-id': entry.sessionId,
          },
            createElement('code', {
              style: {
                fontFamily: 'var(--dsw-alias-font-mono, ui-monospace, monospace)',
                fontSize: '12px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              },
            }, entry.sessionId),
            createElement('span', { style: { fontSize: '12px' } }, entry.running === true ? sdict.running : sdict.idle),
            createElement('button', {
              type: 'button',
              style: { ...buttonStyle, padding: '4px 8px' },
              onClick: () => onCopy(entry.sessionId),
            }, copied ? sdict.copied : sdict.copy),
          )
        }),
        copyFlash === 'failed'
          ? createElement('span', { style: { ...noteStyle, color: 'var(--dsw-alias-danger, #b42318)' } }, sdict.copyFailed)
          : null,
      )
  return createElement('div', {
    key: 'session-id',
    style: { display: 'flex', flexDirection: 'column', gap: '8px', padding: '8px 0' },
    'data-dsh-plugin': 'ice-tools',
    'data-dsh-part': 'session-id',
  },
    createElement('div', { style: { display: 'flex', gap: '8px', alignItems: 'center' } },
      createElement('span', { style: { fontWeight: 600 } }, sdict.title),
      createElement('button', {
        type: 'button',
        style: buttonStyle,
        onClick: onRefresh,
        disabled: sessionsRunning,
        'data-dsh-plugin': 'ice-tools',
        'data-dsh-part': 'session-refresh',
      }, sessionsRunning ? '…' : sdict.refresh),
    ),
    list,
  )
}

function SkillExplorerBlock({ dict }: { readonly dict: typeof zh }): ReactElement {
  const sdict = dict.skillExplorer
  return createElement('div', {
    key: 'skill-explorer',
    style: { display: 'flex', flexDirection: 'column', gap: '8px', padding: '8px 0' },
    'data-dsh-plugin': 'ice-tools',
    'data-dsh-part': 'skill-explorer',
  },
    createElement('span', { style: { fontWeight: 600 } }, sdict.title),
    KNOWN_SKILLS.length === 0
      ? createElement('span', { style: noteStyle }, sdict.empty)
      : createElement('div', {
        style: { display: 'flex', flexDirection: 'column', gap: '4px' },
        'data-dsh-plugin': 'ice-tools',
        'data-dsh-part': 'skill-list',
      },
        KNOWN_SKILLS.map((entry: SkillEntry) =>
          createElement('div', {
            key: entry.name,
            style: {
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
              padding: '6px 10px',
              borderRadius: '8px',
              background: 'var(--dsw-alias-bg-row, rgba(127,127,127,0.05))',
            },
            'data-dsh-skill': entry.name,
          },
            createElement('span', { style: { fontSize: '13px', fontWeight: 500 } }, entry.name),
            createElement('span', { style: noteStyle }, entry.description),
            createElement('span', { style: { ...noteStyle, fontFamily: 'var(--dsw-alias-font-mono, ui-monospace, monospace)' } }, `${sdict.location}: ${entry.location}`),
          ),
        ),
      ),
  )
}

const inputStyle: CSSProperties = {
  padding: '6px 10px',
  borderRadius: '8px',
  border: '1px solid var(--dsw-alias-border, #ccc)',
  background: 'var(--dsw-alias-bg-input, #fff)',
  color: 'inherit',
  fontSize: '13px',
}

function DesktopLauncherBlock({ dict }: { readonly dict: typeof zh }): ReactElement {
  const sdict = dict.desktopLauncher
  const [url, setUrl] = useState('')
  const [outcome, setOutcome] = useState<string>('')
  const onOpen = (): void => {
    void openOrCopyUrl(url, copyToClipboard).then((result) => {
      setOutcome(result.ok ? sdict.hint : result.message === 'unsupported scheme' ? sdict.unsupported : result.message)
    })
  }
  return createElement('div', {
    key: 'desktop-launcher',
    style: { display: 'flex', flexDirection: 'column', gap: '8px', padding: '8px 0' },
    'data-dsh-plugin': 'ice-tools',
    'data-dsh-part': 'desktop-launcher',
  },
    createElement('span', { style: { fontWeight: 600 } }, sdict.title),
    createElement('div', { style: { display: 'flex', gap: '8px' } },
      createElement('input', {
        type: 'text',
        value: url,
        placeholder: sdict.placeholder,
        style: { ...inputStyle, flex: 1 },
        onChange: (e: { target: { value: string } }) => setUrl(e.target.value),
        onKeyDown: (e: { key: string }) => { if (e.key === 'Enter') onOpen() },
        'aria-label': sdict.title,
      }),
      createElement('button', {
        type: 'button',
        style: buttonStyle,
        onClick: onOpen,
        disabled: !isLaunchableUrl(url),
      }, sdict.open),
    ),
    outcome ? createElement('span', { style: noteStyle }, outcome) : null,
  )
}

function PluginManagerBlock({ dict }: { readonly dict: typeof zh }): ReactElement {
  const sdict = dict.pluginManager
  // Parse the in-repo profile patch as a static source of truth: it is the
  // same file the loader reads, so the surface stays consistent with the
  // resolved loader state at runtime.
  const parsed = parseCordisPatch(CORDIS_PATCH_SOURCE)
  return createElement('div', {
    key: 'plugin-manager',
    style: { display: 'flex', flexDirection: 'column', gap: '8px', padding: '8px 0' },
    'data-dsh-plugin': 'ice-tools',
    'data-dsh-part': 'plugin-manager',
  },
    createElement('span', { style: { fontWeight: 600 } }, sdict.title),
    parsed.rows.length === 0
      ? createElement('span', { style: noteStyle }, sdict.empty)
      : createElement('div', {
        style: { display: 'flex', flexDirection: 'column', gap: '4px' },
        'data-dsh-plugin': 'ice-tools',
        'data-dsh-part': 'plugin-rows',
      },
        parsed.rows.map((row, index) =>
          createElement('div', {
            key: `${row.id}-${index}`,
            style: {
              display: 'flex',
              justifyContent: 'space-between',
              padding: '4px 8px',
              borderRadius: '6px',
              background: 'var(--dsw-alias-bg-row, rgba(127,127,127,0.05))',
              fontSize: '12px',
              fontFamily: 'var(--dsw-alias-font-mono, ui-monospace, monospace)',
            },
            'data-dsh-row-id': row.id,
          },
            createElement('span', null, row.id),
            createElement('span', { style: { color: 'var(--dsw-alias-label-secondary, #666)' } }, row.name ?? ''),
          ),
        ),
      ),
  )
}

function GitGraphBlock({ dict }: { readonly dict: typeof zh }): ReactElement {
  const sdict = dict.gitGraph
  const state = readGitGraphState()
  return createElement('div', {
    key: 'git-graph',
    style: { display: 'flex', flexDirection: 'column', gap: '8px', padding: '8px 0' },
    'data-dsh-plugin': 'ice-tools',
    'data-dsh-part': 'git-graph',
  },
    createElement('span', { style: { fontWeight: 600 } }, sdict.title),
    createElement('span', { style: noteStyle }, state.status === 'requires-host' ? sdict.note : ''),
  )
}

function TaskBoardBlock({ dict }: { readonly dict: typeof zh }): ReactElement {
  const sdict = dict.taskBoard
  const [tasks, setTasks] = useState<readonly Task[]>(() => loadTasks())
  const [draft, setDraft] = useState('')
  const onAdd = (): void => {
    setTasks(addTask(tasks, draft))
    setDraft('')
  }
  return createElement('div', {
    key: 'task-board',
    style: { display: 'flex', flexDirection: 'column', gap: '8px', padding: '8px 0' },
    'data-dsh-plugin': 'ice-tools',
    'data-dsh-part': 'task-board',
  },
    createElement('span', { style: { fontWeight: 600 } }, sdict.title),
    createElement('div', { style: { display: 'flex', gap: '8px' } },
      createElement('input', {
        type: 'text',
        value: draft,
        placeholder: sdict.placeholder,
        style: { ...inputStyle, flex: 1 },
        onChange: (e: { target: { value: string } }) => setDraft(e.target.value),
        onKeyDown: (e: { key: string }) => { if (e.key === 'Enter') onAdd() },
      }),
      createElement('button', {
        type: 'button',
        style: buttonStyle,
        onClick: onAdd,
        disabled: draft.trim().length === 0,
      }, sdict.add),
    ),
    tasks.length === 0
      ? createElement('span', { style: noteStyle }, sdict.empty)
      : createElement('div', {
        style: { display: 'flex', flexDirection: 'column', gap: '4px' },
        'data-dsh-plugin': 'ice-tools',
        'data-dsh-part': 'task-list',
      },
        tasks.map((task) =>
          createElement('div', {
            key: task.id,
            style: {
              display: 'grid',
              gridTemplateColumns: 'auto 1fr auto',
              gap: '8px',
              alignItems: 'center',
              padding: '4px 8px',
              borderRadius: '6px',
              background: 'var(--dsw-alias-bg-row, rgba(127,127,127,0.05))',
            },
            'data-dsh-task': task.id,
          },
            createElement('input', {
              type: 'checkbox',
              checked: task.done,
              onChange: () => setTasks(toggleTask(tasks, task.id)),
            }),
            createElement('span', {
              style: {
                fontSize: '13px',
                textDecoration: task.done ? 'line-through' : 'none',
                color: task.done ? 'var(--dsw-alias-label-secondary, #666)' : 'inherit',
              },
            }, task.title),
            createElement('button', {
              type: 'button',
              style: { ...buttonStyle, padding: '2px 6px', fontSize: '12px' },
              onClick: () => setTasks(removeTask(tasks, task.id)),
            }, sdict.remove),
          ),
        ),
      ),
  )
}

function ChatRecoveryBlock({ dict }: { readonly dict: typeof zh }): ReactElement {
  const sdict = dict.chatRecovery
  const state = readChatRecoveryState()
  return createElement('div', {
    key: 'chat-recovery',
    style: { display: 'flex', flexDirection: 'column', gap: '8px', padding: '8px 0' },
    'data-dsh-plugin': 'ice-tools',
    'data-dsh-part': 'chat-recovery',
  },
    createElement('span', { style: { fontWeight: 600 } }, sdict.title),
    createElement('span', { style: noteStyle }, state.status === 'requires-host' ? sdict.note : ''),
  )
}

const CORDIS_PATCH_SOURCE = `- insert:
    - id: tool-subagent-codex
      name: '@deepseek-ai/dsh-tool-subagent'
      config:
        provider: codex
        toolName: subagent_codex
        backgroundMode: one-shot
        maxDepth: provider-managed`

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
