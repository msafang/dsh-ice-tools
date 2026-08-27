import { createElement, useEffect, useState, type CSSProperties, type ReactElement } from 'react'
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type { Disposer, ReactElementLike, SettingsScope } from '../../core/dsh-adapter/index.ts'
import { DEFAULT_ENABLED, MODULE_NAMES, normalizeEnabled, type EnabledModules, type IceConfig, type ModuleName } from '../../core/dispatch/index.ts'
import { runDoctor, type DoctorRun } from '../doctor/client.ts'
import { KNOWN_SKILLS, mirrorToEntries, readSkillsMirror, type SkillEntry } from '../skill-explorer/client.ts'
import { copyToClipboard, cancelSession, createSession, filterSessions, joinSessionIds, listSessions, renameSession, type SessionSummary } from '../session-id/client.ts'
import { isLaunchableUrl, loadHistory, openOrCopyUrl, QUICK_PRESETS, recordHistory, removeHistory, type UrlScheme } from '../desktop-launcher/client.ts'
import { parseCordisPatch } from '../plugin-manager/client.ts'
import { parseGitGraphOutput, summarizeGraph } from '../git-graph/client.ts'
import { addTask, exportJson, exportMarkdown, filterTasks, isBlocked, isOverdue, isoOffsetDays, loadTasks, moveTask, removeTask, setDueDate, sortTasks, TASK_TEMPLATES, toggleTask, type StatusFilter, type Task, type TaskTemplate, type Priority } from '../task-board/client.ts'
import { addFailedSession, clearFailedSessions, exportRecoveryJson, importRecoveryJson, loadFailedSessions, markFailedSession, removeFailedSession, sortFailedSessions, type FailedSession } from '../chat-recovery/client.ts'
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
  const [resetFlash, setResetFlash] = useState(false)
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

  const onReset = (): void => {
    if (typeof window !== 'undefined') {
      const accepted = window.confirm(dict.pageHints.resetConfirm)
      if (!accepted) return
    }
    void scope.unset('enabled')
    setResetFlash(true)
    if (typeof window !== 'undefined') {
      window.setTimeout(() => setResetFlash(false), 1500)
    }
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

  const headerRow = createElement('div', {
    key: 'header',
    style: { display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', padding: '4px 0' },
    'data-dsh-plugin': 'ice-tools',
    'data-dsh-part': 'settings-header',
  },
    createElement('span', { style: { ...noteStyle, flex: 1 } }, dict.pageHints.toggleGuidance),
    resetFlash
      ? createElement('span', { style: { ...noteStyle, color: 'var(--dsw-alias-success, #0a7d2c)' } }, dict.pageHints.resetDone)
      : null,
    createElement('button', {
      type: 'button',
      style: { ...buttonStyle, padding: '4px 10px', fontSize: '12px' },
      onClick: onReset,
      disabled: !writable,
      'data-dsh-plugin': 'ice-tools',
      'data-dsh-part': 'settings-reset',
    }, dict.pageHints.resetButton),
  )

  // Each module toggle gates its corresponding utility block. settingsHub
  // itself is non-toggleable; the rest flip on a per-block basis. The
  // frozen-blocks (gitGraph, chatRecovery) keep their "requires host" note
  // intact while only rendering when the user opts in.
  const blockFor = (id: ModuleName, element: ReactElement): ReactElement | null =>
    enabled[id] ? element : null

  return createElement('section', { 'data-dsh-plugin': 'ice-tools', style: sectionStyle },
    headerRow,
    rows,
    blockFor('doctor', createElement(DoctorBlock, { key: 'doctor', dict, ctx })),
    blockFor('sessionId', createElement(SessionIdBlock, { key: 'session-id', dict, ctx })),
    blockFor('skillExplorer', createElement(SkillExplorerBlock, { key: 'skill-explorer', dict, ctx })),
    blockFor('desktopLauncher', createElement(DesktopLauncherBlock, { key: 'desktop-launcher', dict, ctx })),
    blockFor('pluginManager', createElement(PluginManagerBlock, { key: 'plugin-manager', dict })),
    blockFor('gitGraph', createElement(GitGraphBlock, { key: 'git-graph', dict })),
    blockFor('taskBoard', createElement(TaskBoardBlock, { key: 'task-board', dict })),
    blockFor('chatRecovery', createElement(ChatRecoveryBlock, { key: 'chat-recovery', dict })),
  )
}

interface DoctorHistoryEntry {
  readonly ranAt: number
  readonly pass: number
  readonly fail: number
  readonly durationMs: number
}

const DOCTOR_HISTORY_KEY = 'dsh-ice-tools.doctor.history.v1'
const DOCTOR_HISTORY_LIMIT = 5

function safeDoctorStorage(): Storage | undefined {
  const g = (typeof globalThis !== 'undefined' ? globalThis : undefined) as
    | { localStorage?: Storage; window?: { localStorage?: Storage } }
    | undefined
  return g?.window?.localStorage ?? g?.localStorage
}

function loadDoctorHistory(): readonly DoctorHistoryEntry[] {
  const store = safeDoctorStorage()
  if (store === undefined) return []
  const raw = store.getItem(DOCTOR_HISTORY_KEY)
  if (raw === null) return []
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    const entries: DoctorHistoryEntry[] = []
    for (const item of parsed) {
      if (typeof item !== 'object' || item === null) continue
      const candidate = item as Record<string, unknown>
      if (typeof candidate.ranAt !== 'number') continue
      if (typeof candidate.pass !== 'number') continue
      if (typeof candidate.fail !== 'number') continue
      if (typeof candidate.durationMs !== 'number') continue
      entries.push({
        ranAt: candidate.ranAt,
        pass: candidate.pass,
        fail: candidate.fail,
        durationMs: candidate.durationMs,
      })
    }
    return entries
  } catch {
    return []
  }
}

function persistDoctorHistory(entries: readonly DoctorHistoryEntry[]): void {
  const store = safeDoctorStorage()
  if (store === undefined) return
  try {
    store.setItem(DOCTOR_HISTORY_KEY, JSON.stringify(entries))
  } catch {
    // localStorage may be disabled (private browsing) or quota-exceeded;
    // the in-memory history still works for this session.
  }
}

function summarize(run: DoctorRun, durationMs: number): DoctorHistoryEntry {
  let pass = 0
  let fail = 0
  for (const result of run.results) {
    if (result.pass) pass += 1
    else fail += 1
  }
  return { ranAt: run.ranAt, pass, fail, durationMs }
}

function DoctorBlock({ dict, ctx }: { readonly dict: typeof zh; readonly ctx: ClientContext | undefined }): ReactElement {
  const sdict = dict.doctor
  const [doctorRun, setDoctorRun] = useState<DoctorRun | undefined>(undefined)
  const [doctorRunning, setDoctorRunning] = useState(false)
  const [history, setHistory] = useState<readonly DoctorHistoryEntry[]>(() => loadDoctorHistory())
  const lastRunAt = history[0]?.ranAt
  const onRun = (): void => {
    if (ctx === undefined || doctorRunning) return
    setDoctorRunning(true)
    const started = Date.now()
    void runDoctor(ctx).then((result) => {
      const duration = Date.now() - started
      setDoctorRun(result)
      setDoctorRunning(false)
      const summary = summarize(result, duration)
      setHistory((previous) => {
        const next = [summary, ...previous].slice(0, DOCTOR_HISTORY_LIMIT)
        persistDoctorHistory(next)
        return next
      })
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
      doctorRun !== undefined
        ? createElement('button', {
          type: 'button',
          style: { ...buttonStyle, padding: '4px 8px', fontSize: '12px' },
          onClick: onRun,
          disabled: doctorRunning || ctx === undefined,
          'data-dsh-plugin': 'ice-tools',
          'data-dsh-part': 'doctor-rerun',
        }, sdict.rerun)
        : null,
      lastRunAt !== undefined
        ? createElement('span', { style: { ...noteStyle, fontSize: '11px' } }, `${sdict.lastRun}: ${formatTimeAgo(lastRunAt)}`)
        : null,
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
    history.length > 0
      ? createElement('div', {
        style: { display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' },
        'data-dsh-plugin': 'ice-tools',
        'data-dsh-part': 'doctor-history',
      },
        createElement('span', { style: { ...noteStyle, fontWeight: 600 } }, sdict.historyTitle),
        history.map((entry, index) =>
          createElement('div', {
            key: entry.ranAt,
            style: {
              display: 'grid',
              gridTemplateColumns: 'auto 1fr auto auto',
              gap: '8px',
              fontSize: '11px',
              padding: '4px 8px',
              borderRadius: '6px',
              background: 'var(--dsw-alias-bg-row, rgba(127,127,127,0.05))',
            },
            'data-dsh-history-index': index,
          },
            createElement('span', { style: { color: 'var(--dsw-alias-label-secondary, #666)' } }, formatTime(entry.ranAt)),
            createElement('span', null, `${entry.pass} ${sdict.passed}, ${entry.fail} ${sdict.failed}`),
            createElement('span', { style: { color: 'var(--dsw-alias-label-secondary, #666)' } }, `${entry.durationMs} ${sdict.ms}`),
            createElement('span', { style: { color: 'var(--dsw-alias-label-secondary, #666)' } }, formatTimeAgo(entry.ranAt)),
          ),
        ),
      )
      : null,
  )
}

function formatTime(ranAt: number): string {
  const date = new Date(ranAt)
  const hh = String(date.getHours()).padStart(2, '0')
  const mm = String(date.getMinutes()).padStart(2, '0')
  const ss = String(date.getSeconds()).padStart(2, '0')
  return `${hh}:${mm}:${ss}`
}

function formatTimeAgo(ranAt: number, now: number = Date.now()): string {
  const diff = Math.max(0, now - ranAt)
  const seconds = Math.floor(diff / 1000)
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function SessionIdBlock({ dict, ctx }: { readonly dict: typeof zh; readonly ctx: ClientContext | undefined }): ReactElement {
  const sdict = dict.sessionId
  const [sessions, setSessions] = useState<readonly SessionSummary[]>([])
  const [sessionsError, setSessionsError] = useState<string | undefined>(undefined)
  const [sessionsRunning, setSessionsRunning] = useState(false)
  const [copyFlash, setCopyFlash] = useState<string | undefined>(undefined)
  const [status, setStatus] = useState<'all' | 'running' | 'idle'>('all')
  const [newCwd, setNewCwd] = useState('')
  const [editingId, setEditingId] = useState<string | undefined>(undefined)
  const [editingValue, setEditingValue] = useState('')
  const [feedback, setFeedback] = useState<string | undefined>(undefined)
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
  const onCopyAll = (): void => {
    void copyToClipboard(joinSessionIds(sessions)).then((outcome) => {
      setFeedback(outcome.ok ? sdict.copiedAll : sdict.copyFailed)
      if (typeof window !== 'undefined') {
        window.setTimeout(() => setFeedback(undefined), 1500)
      }
    })
  }
  const onCreate = (): void => {
    if (ctx === undefined) return
    void createSession(ctx, newCwd).then((result) => {
      setFeedback(result.ok ? sdict.created : result.message)
      if (typeof window !== 'undefined') {
        window.setTimeout(() => setFeedback(undefined), 2000)
      }
      if (result.ok) {
        setNewCwd('')
        onRefresh()
      }
    })
  }
  const beginEdit = (entry: SessionSummary): void => {
    setEditingId(entry.sessionId)
    setEditingValue(entry.title ?? '')
  }
  const commitEdit = (): void => {
    if (ctx === undefined || editingId === undefined) return
    const sessionId = editingId
    const title = editingValue
    setEditingId(undefined)
    setEditingValue('')
    void renameSession(ctx, sessionId, title).then((result) => {
      setFeedback(result.ok ? sdict.renamed : result.message)
      if (typeof window !== 'undefined') {
        window.setTimeout(() => setFeedback(undefined), 2000)
      }
      if (result.ok) onRefresh()
    })
  }
  const onCancel = (sessionId: string): void => {
    if (ctx === undefined) return
    void cancelSession(ctx, sessionId).then((result) => {
      setFeedback(result.ok ? sdict.cancelled : result.message)
      if (typeof window !== 'undefined') {
        window.setTimeout(() => setFeedback(undefined), 2000)
      }
      if (result.ok) onRefresh()
    })
  }
  const visible = filterSessions(sessions, status)
  const list = sessionsError !== undefined
    ? createElement('span', { style: noteStyle }, sessionsError)
    : sessions.length === 0
      ? createElement('span', { style: noteStyle }, sdict.empty)
      : visible.length === 0
        ? createElement('span', { style: noteStyle }, sdict.emptyFilter)
        : createElement('div', {
          style: { display: 'flex', flexDirection: 'column', gap: '4px' },
          'data-dsh-plugin': 'ice-tools',
          'data-dsh-part': 'session-list',
        },
          visible.map((entry) => {
            const copied = copyFlash === `copied:${entry.sessionId}`
            const editing = editingId === entry.sessionId
            return createElement('div', {
              key: entry.sessionId,
              style: {
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                padding: '6px 10px',
                borderRadius: '6px',
                background: 'var(--dsw-alias-bg-row, rgba(127,127,127,0.05))',
              },
              'data-dsh-session-id': entry.sessionId,
              'data-dsh-running': entry.running === true ? 'true' : 'false',
            },
              createElement('div', {
                style: {
                  display: 'grid',
                  gridTemplateColumns: '1fr auto auto auto',
                  gap: '8px',
                  alignItems: 'center',
                },
              },
                editing
                  ? createElement('input', {
                    type: 'text',
                    value: editingValue,
                    style: { ...inputStyle, fontFamily: 'inherit' },
                    onChange: (e: { target: { value: string } }) => setEditingValue(e.target.value),
                    onBlur: () => commitEdit(),
                    onKeyDown: (e: { key: string }) => {
                      if (e.key === 'Enter') commitEdit()
                      if (e.key === 'Escape') { setEditingId(undefined); setEditingValue('') }
                    },
                    autoFocus: true,
                  })
                  : createElement('code', {
                    style: {
                      fontFamily: 'var(--dsw-alias-font-mono, ui-monospace, monospace)',
                      fontSize: '12px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      cursor: 'pointer',
                    },
                    onClick: () => beginEdit(entry),
                    title: entry.sessionId,
                  }, entry.sessionId),
                createElement('span', {
                  style: {
                    fontSize: '11px',
                    padding: '1px 6px',
                    borderRadius: '4px',
                    background: entry.running === true ? 'var(--dsw-alias-success-bg, #d1f7e0)' : 'var(--dsw-alias-bg-row, #eee)',
                    color: entry.running === true ? 'var(--dsw-alias-success, #0a7d2c)' : 'var(--dsw-alias-label-secondary, #666)',
                  },
                }, entry.running === true ? sdict.running : sdict.idle),
                createElement('button', {
                  type: 'button',
                  style: { ...buttonStyle, padding: '2px 8px', fontSize: '11px' },
                  onClick: () => onCopy(entry.sessionId),
                }, copied ? sdict.copied : sdict.copy),
                createElement('button', {
                  type: 'button',
                  style: { ...buttonStyle, padding: '2px 8px', fontSize: '11px' },
                  disabled: entry.running !== true,
                  onClick: () => onCancel(entry.sessionId),
                }, sdict.cancel),
              ),
              createElement('div', { style: { display: 'flex', gap: '8px', alignItems: 'center', fontSize: '11px', color: 'var(--dsw-alias-label-secondary, #666)' } },
                entry.title !== undefined && entry.title.length > 0
                  ? createElement('span', { style: { cursor: 'pointer' }, onClick: () => beginEdit(entry) }, entry.title)
                  : createElement('span', { style: { fontStyle: 'italic' } }, sdict.untitled),
                entry.cwd !== undefined ? createElement('span', { style: { fontFamily: 'var(--dsw-alias-font-mono, ui-monospace, monospace)' } }, entry.cwd) : null,
              ),
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
    createElement('div', { style: { display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' } },
      createElement('span', { style: { fontWeight: 600 } }, sdict.title),
      createElement('button', {
        type: 'button',
        style: buttonStyle,
        onClick: onRefresh,
        disabled: sessionsRunning,
        'data-dsh-plugin': 'ice-tools',
        'data-dsh-part': 'session-refresh',
      }, sessionsRunning ? '…' : sdict.refresh),
      createElement('button', {
        type: 'button',
        style: { ...buttonStyle, padding: '4px 8px' },
        onClick: onCopyAll,
        disabled: sessions.length === 0,
        'data-dsh-plugin': 'ice-tools',
        'data-dsh-part': 'session-copy-all',
      }, sdict.copyAll),
      createElement('div', { style: { display: 'flex', gap: '4px' } },
        (['all', 'running', 'idle'] as const).map((option) =>
          createElement('button', {
            key: option,
            type: 'button',
            style: {
              ...buttonStyle,
              padding: '2px 8px',
              fontSize: '12px',
              background: status === option ? 'var(--dsw-alias-bg-elevated, #ddd)' : undefined,
            },
            onClick: () => setStatus(option),
            'data-dsh-filter': option,
          }, sdict[`filter${option[0]!.toUpperCase()}${option.slice(1)}` as keyof typeof sdict] as string),
        ),
      ),
    ),
    createElement('div', { style: { display: 'flex', gap: '8px' } },
      createElement('input', {
        type: 'text',
        value: newCwd,
        placeholder: sdict.newCwdPlaceholder,
        style: { ...inputStyle, flex: 1 },
        onChange: (e: { target: { value: string } }) => setNewCwd(e.target.value),
        onKeyDown: (e: { key: string }) => { if (e.key === 'Enter') onCreate() },
        'data-dsh-plugin': 'ice-tools',
        'data-dsh-part': 'session-cwd',
      }),
      createElement('button', {
        type: 'button',
        style: buttonStyle,
        onClick: onCreate,
        disabled: ctx === undefined,
        'data-dsh-plugin': 'ice-tools',
        'data-dsh-part': 'session-create',
      }, sdict.newSession),
    ),
    feedback
      ? createElement('span', { style: { ...noteStyle, color: 'var(--dsw-alias-success, #0a7d2c)' } }, feedback)
      : null,
    list,
  )
}

function SkillExplorerBlock({ dict, ctx }: { readonly dict: typeof zh; readonly ctx: ClientContext | undefined }): ReactElement {
  const sdict = dict.skillExplorer
  // Inline the mirror scope shape so the component does not depend on the
  // wider `SettingsScopeLike` boundary type. The settingsScope service is
  // registered by dsh-client-ui-settings on the client runtime.
  const skillScope = (ctx as unknown as { settingsScope: { bind<T>(spec: { namespace: string; decode(s: unknown): T | undefined }): { getSnapshot(): { value: T | undefined }; subscribe(listener: () => void): () => void } } }).settingsScope
  const bound = skillScope.bind({
    namespace: 'ice-tools-skills',
    decode: (section: unknown) => {
      if (typeof section !== 'object' || section === null) return undefined
      const candidate = section as { entries?: unknown; generatedAt?: unknown }
      if (!Array.isArray(candidate.entries)) return undefined
      const entries: { name: string; description: string }[] = []
      for (const item of candidate.entries) {
        if (typeof item !== 'object' || item === null) continue
        const entry = item as { name?: unknown; description?: unknown }
        if (typeof entry.name !== 'string' || typeof entry.description !== 'string') continue
        entries.push({ name: entry.name, description: entry.description })
      }
      return {
        entries,
        generatedAt: typeof candidate.generatedAt === 'number' ? candidate.generatedAt : Date.now(),
      }
    },
  })
  const [mirror, setMirror] = useState(() => readSkillsMirror(bound))
  useEffect(() => {
    const off = bound.subscribe(() => setMirror(readSkillsMirror(bound)))
    return () => off()
  }, [bound])
  // Fall back to the static catalogue when the host has not (yet) populated
  // the mirror; the explorer still shows something on hosts that pre-date
  // the skills namespace.
  const entries = mirror !== undefined && mirror.entries.length > 0
    ? mirrorToEntries(mirror)
    : KNOWN_SKILLS
  return createElement('div', {
    key: 'skill-explorer',
    style: { display: 'flex', flexDirection: 'column', gap: '8px', padding: '8px 0' },
    'data-dsh-plugin': 'ice-tools',
    'data-dsh-part': 'skill-explorer',
  },
    createElement('div', { style: { display: 'flex', gap: '8px', alignItems: 'center' } },
      createElement('span', { style: { fontWeight: 600 } }, sdict.title),
      mirror !== undefined && mirror.entries.length > 0
        ? createElement('span', {
          style: { ...noteStyle, fontSize: '11px' },
          'data-dsh-plugin': 'ice-tools',
          'data-dsh-part': 'skill-source',
        }, sdict.liveMirror)
        : createElement('span', {
          style: { ...noteStyle, fontSize: '11px' },
          'data-dsh-plugin': 'ice-tools',
          'data-dsh-part': 'skill-source',
        }, sdict.staticFallback),
    ),
    entries.length === 0
      ? createElement('span', { style: noteStyle }, sdict.empty)
      : createElement('div', {
        style: { display: 'flex', flexDirection: 'column', gap: '4px' },
        'data-dsh-plugin': 'ice-tools',
        'data-dsh-part': 'skill-list',
      },
        entries.map((entry: SkillEntry) =>
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

function DesktopLauncherBlock({ dict, ctx }: { readonly dict: typeof zh; readonly ctx: ClientContext | undefined }): ReactElement {
  const sdict = dict.desktopLauncher
  const [url, setUrl] = useState('')
  const [outcome, setOutcome] = useState<string>('')
  const [history, setHistory] = useState(() => loadHistory())
  const [filter, setFilter] = useState<'all' | UrlScheme>('all')
  const onOpen = (raw: string = url): void => {
    void openOrCopyUrl(raw, copyToClipboard).then((result) => {
      if (result.ok) {
        setHistory(recordHistory(history, raw))
        setOutcome(sdict.hint)
      } else if (result.message === 'unsupported scheme') {
        setOutcome(sdict.unsupported)
      } else {
        setOutcome(result.message)
      }
    })
  }
  const visible = filter === 'all' ? history : history.filter((entry: { scheme: UrlScheme }) => entry.scheme === filter)
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
        onClick: () => onOpen(),
        disabled: !isLaunchableUrl(url),
      }, sdict.open),
    ),
    createElement('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap' } },
      QUICK_PRESETS.map((preset: { id: string; label: { en: string; zh: string }; placeholder: string }) =>
        createElement('button', {
          key: preset.id,
          type: 'button',
          style: { ...buttonStyle, padding: '4px 8px', fontSize: '12px' },
          onClick: () => setUrl(preset.placeholder),
          title: preset.placeholder,
          'data-dsh-preset': preset.id,
        }, preset.label[activeLocale(ctx)] ?? preset.label.en),
      ),
    ),
    history.length > 0
      ? createElement('div', {
        style: { display: 'flex', flexDirection: 'column', gap: '4px' },
        'data-dsh-plugin': 'ice-tools',
        'data-dsh-part': 'launcher-history',
      },
        createElement('div', { style: { display: 'flex', gap: '4px', flexWrap: 'wrap' } },
          (['all', 'https', 'http', 'mailto'] as const).map((option) =>
            createElement('button', {
              key: option,
              type: 'button',
              style: {
                ...buttonStyle,
                padding: '2px 8px',
                fontSize: '12px',
                background: filter === option ? 'var(--dsw-alias-bg-elevated, #ddd)' : undefined,
              },
              onClick: () => setFilter(option),
              'data-dsh-filter': option,
            }, option),
          ),
        ),
        visible.length === 0
          ? createElement('span', { style: noteStyle }, sdict.historyEmpty)
          : createElement('div', {
            style: { display: 'flex', flexDirection: 'column', gap: '2px' },
          },
            visible.map((entry: { url: string; scheme: UrlScheme; usedAt: number }) =>
              createElement('div', {
                key: entry.url,
                style: {
                  display: 'grid',
                  gridTemplateColumns: '1fr auto auto',
                  gap: '8px',
                  alignItems: 'center',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  background: 'var(--dsw-alias-bg-row, rgba(127,127,127,0.05))',
                  fontSize: '12px',
                },
                'data-dsh-history-url': entry.url,
              },
                createElement('code', {
                  style: {
                    fontFamily: 'var(--dsw-alias-font-mono, ui-monospace, monospace)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  },
                  onClick: () => setUrl(entry.url),
                }, entry.url),
                createElement('button', {
                  type: 'button',
                  style: { ...buttonStyle, padding: '2px 8px', fontSize: '12px' },
                  onClick: () => onOpen(entry.url),
                }, sdict.open),
                createElement('button', {
                  type: 'button',
                  style: { ...buttonStyle, padding: '2px 8px', fontSize: '12px' },
                  onClick: () => setHistory(removeHistory(history, entry.url)),
                  'aria-label': sdict.remove,
                }, '×'),
              ),
            ),
          ),
      )
      : null,
    outcome ? createElement('span', { style: noteStyle }, outcome) : null,
  )
}

function localeForPreset(): 'en' | 'zh' {
  // Best-effort: the desktopLauncher block does not own the locale
  // runtime, so it picks the matching label on the inline currentLocale
  // navigator hint. Tests fall back to English.
  if (typeof navigator === 'undefined') return 'en'
  const lang = navigator.language?.toLowerCase() ?? 'en'
  return lang.startsWith('zh') ? 'zh' : 'en'
}

function activeLocale(ctx: ClientContext | undefined): 'en' | 'zh' {
  if (ctx === undefined) return localeForPreset()
  const runtime = (ctx as unknown as { locale?: { getSnapshot(): { active: string } } }).locale
  if (runtime === undefined) return localeForPreset()
  try {
    const active = runtime.getSnapshot().active
    return active.toLowerCase().startsWith('zh') ? 'zh' : 'en'
  } catch {
    return localeForPreset()
  }
}

function PluginManagerBlock({ dict }: { readonly dict: typeof zh }): ReactElement {
  const sdict = dict.pluginManager
  const parsed = parseCordisPatch(CORDIS_PATCH_SOURCE)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [copiedPath, setCopiedPath] = useState(false)
  const duplicateIds = new Set(parsed.duplicates.map((entry) => entry.id))
  const onCopyPath = (): void => {
    void copyToClipboard(PATCH_PATH).then((outcome) => {
      setCopiedPath(outcome.ok)
      if (typeof window !== 'undefined') {
        window.setTimeout(() => setCopiedPath(false), 1500)
      }
    })
  }
  return createElement('div', {
    key: 'plugin-manager',
    style: { display: 'flex', flexDirection: 'column', gap: '8px', padding: '8px 0' },
    'data-dsh-plugin': 'ice-tools',
    'data-dsh-part': 'plugin-manager',
  },
    createElement('div', { style: { display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' } },
      createElement('span', { style: { fontWeight: 600 } }, sdict.title),
      createElement('span', {
        style: { ...noteStyle, fontFamily: 'var(--dsw-alias-font-mono, ui-monospace, monospace)' },
        'data-dsh-plugin': 'ice-tools',
        'data-dsh-part': 'plugin-source',
      }, PATCH_PATH),
      createElement('button', {
        type: 'button',
        style: { ...buttonStyle, padding: '2px 8px', fontSize: '11px' },
        onClick: onCopyPath,
        'data-dsh-plugin': 'ice-tools',
        'data-dsh-part': 'plugin-copy-path',
      }, copiedPath ? sdict.copiedPath : sdict.copyPath),
    ),
    parsed.duplicates.length > 0
      ? createElement('div', {
        style: { ...noteStyle, color: 'var(--dsw-alias-danger, #b42318)' },
        'data-dsh-plugin': 'ice-tools',
        'data-dsh-part': 'plugin-duplicates',
      },
        `${sdict.duplicates}: ${parsed.duplicates.map((entry) => `${entry.id} (${entry.lines.join(', ')})`).join('; ')}`,
      )
      : null,
    parsed.rows.length === 0
      ? createElement('span', { style: noteStyle }, sdict.empty)
      : createElement('div', {
        style: { display: 'flex', flexDirection: 'column', gap: '4px' },
        'data-dsh-plugin': 'ice-tools',
        'data-dsh-part': 'plugin-rows',
      },
        parsed.rows.map((row, index) => {
          const isExpanded = expanded[`${row.id}-${index}`] === true
          const isDuplicate = duplicateIds.has(row.id)
          return createElement('div', {
            key: `${row.id}-${index}`,
            style: {
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              padding: '6px 10px',
              borderRadius: '6px',
              background: isDuplicate
                ? 'rgba(180, 35, 24, 0.08)'
                : 'var(--dsw-alias-bg-row, rgba(127,127,127,0.05))',
            },
            'data-dsh-row-id': row.id,
            'data-dsh-row-line': row.line,
            'data-dsh-row-duplicate': isDuplicate ? 'true' : 'false',
          },
            createElement('div', {
              style: {
                display: 'grid',
                gridTemplateColumns: '1fr auto auto',
                gap: '8px',
                alignItems: 'center',
              },
            },
              createElement('span', {
                style: {
                  fontFamily: 'var(--dsw-alias-font-mono, ui-monospace, monospace)',
                  fontSize: '12px',
                  cursor: 'pointer',
                },
                onClick: () => setExpanded((current) => ({ ...current, [`${row.id}-${index}`]: !isExpanded })),
              }, row.id),
              createElement('span', {
                style: { ...noteStyle, fontSize: '11px' },
              }, `L${row.line}`),
              createElement('button', {
                type: 'button',
                style: { ...buttonStyle, padding: '2px 8px', fontSize: '11px' },
                onClick: () => setExpanded((current) => ({ ...current, [`${row.id}-${index}`]: !isExpanded })),
                'aria-label': isExpanded ? sdict.collapse : sdict.expand,
              }, isExpanded ? '−' : '+'),
            ),
            row.name !== undefined
              ? createElement('span', { style: { fontSize: '11px', color: 'var(--dsw-alias-label-secondary, #666)' } }, row.name)
              : null,
            isExpanded
              ? createElement('div', {
                style: { display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '4px' },
                'data-dsh-plugin': 'ice-tools',
                'data-dsh-part': 'plugin-row-config',
              },
                Object.keys(row.config).length === 0
                  ? createElement('span', { style: { ...noteStyle, fontStyle: 'italic' } }, sdict.noConfig)
                  : Object.entries(row.config).map(([key, value]) =>
                      createElement('div', {
                        key,
                        style: {
                          display: 'grid',
                          gridTemplateColumns: '120px 1fr',
                          gap: '8px',
                          fontSize: '11px',
                          fontFamily: 'var(--dsw-alias-font-mono, ui-monospace, monospace)',
                        },
                      },
                        createElement('span', { style: { color: 'var(--dsw-alias-label-secondary, #666)' } }, key),
                        createElement('span', null, value),
                      ),
                    ),
              )
              : null,
          )
        }),
      ),
  )
}

function GitGraphBlock({ dict }: { readonly dict: typeof zh }): ReactElement {
  const sdict = dict.gitGraph
  const [pasted, setPasted] = useState('')
  const parsed = parseGitGraphOutput(pasted)
  const summary = summarizeGraph(parsed)
  return createElement('div', {
    key: 'git-graph',
    style: { display: 'flex', flexDirection: 'column', gap: '8px', padding: '8px 0' },
    'data-dsh-plugin': 'ice-tools',
    'data-dsh-part': 'git-graph',
  },
    createElement('span', { style: { fontWeight: 600 } }, sdict.title),
    createElement('span', { style: noteStyle }, sdict.hint),
    createElement('textarea', {
      value: pasted,
      placeholder: sdict.placeholder,
      style: {
        ...inputStyle,
        minHeight: '96px',
        fontFamily: 'var(--dsw-alias-font-mono, ui-monospace, monospace)',
        fontSize: '12px',
      },
      onChange: (e: { target: { value: string } }) => setPasted(e.target.value),
      'data-dsh-plugin': 'ice-tools',
      'data-dsh-part': 'git-graph-input',
    }),
    parsed.length === 0
      ? createElement('span', { style: noteStyle }, sdict.empty)
      : createElement('div', {
        style: {
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
          padding: '8px 10px',
          borderRadius: '8px',
          background: 'var(--dsw-alias-bg-row, rgba(127,127,127,0.05))',
          fontFamily: 'var(--dsw-alias-font-mono, ui-monospace, monospace)',
          fontSize: '12px',
          maxHeight: '300px',
          overflow: 'auto',
        },
        'data-dsh-plugin': 'ice-tools',
        'data-dsh-part': 'git-graph-output',
      },
        createElement('span', { style: { ...noteStyle, marginBottom: '4px' } },
          `${sdict.commits}: ${summary.commitCount} · ${sdict.merges}: ${summary.mergeCount} · ${sdict.branches}: ${summary.branchCount} · ${sdict.other}: ${summary.otherCount}`,
        ),
        parsed.map((line, idx) =>
          createElement('div', {
            key: idx,
            style: {
              display: 'flex',
              gap: '8px',
              paddingLeft: `${line.depth * 8}px`,
              whiteSpace: 'pre',
            },
            'data-dsh-line-kind': line.kind,
          },
            createElement('span', {
              style: {
                color: line.kind === 'commit' ? 'var(--dsw-alias-success, #0a7d2c)'
                  : line.kind === 'merge' ? 'var(--dsw-alias-warning, #a86b00)'
                  : line.kind === 'branch' ? 'var(--dsw-alias-label-secondary, #666)'
                  : 'inherit',
              },
            }, line.text),
          ),
        ),
      ),
  )
}

function TaskBoardBlock({ dict }: { readonly dict: typeof zh }): ReactElement {
  const sdict = dict.taskBoard
  const [tasks, setTasks] = useState<readonly Task[]>(() => loadTasks())
  const [draft, setDraft] = useState('')
  const [priority, setPriority] = useState<Priority>('medium')
  const [status, setStatus] = useState<StatusFilter>('all')
  const [query, setQuery] = useState('')
  const onAdd = (): void => {
    setTasks(addTask(tasks, draft, { priority }))
    setDraft('')
  }
  const onTemplate = (template: TaskTemplate): void => {
    const options = template.dueOffsetDays === undefined
      ? { priority: template.priority }
      : { priority: template.priority, dueDate: isoOffsetDays(template.dueOffsetDays) }
    setTasks(addTask(tasks, template.title, options))
  }
  const filtered = sortTasks(filterTasks(tasks, status, query))
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
      createElement('select', {
        value: priority,
        style: inputStyle,
        onChange: (e: { target: { value: string } }) => setPriority(e.target.value as Priority),
        'aria-label': sdict.priority,
      },
        createElement('option', { value: 'high' }, sdict.priorityHigh),
        createElement('option', { value: 'medium' }, sdict.priorityMedium),
        createElement('option', { value: 'low' }, sdict.priorityLow),
      ),
      createElement('button', {
        type: 'button',
        style: buttonStyle,
        onClick: onAdd,
        disabled: draft.trim().length === 0,
      }, sdict.add),
    ),
    createElement('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap' } },
      TASK_TEMPLATES.map((template) =>
        createElement('button', {
          key: template.id,
          type: 'button',
          style: { ...buttonStyle, padding: '4px 8px', fontSize: '12px' },
          onClick: () => onTemplate(template),
          'data-dsh-template': template.id,
        }, template.title),
      ),
    ),
    createElement('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap' } },
      createElement('input', {
        type: 'text',
        value: query,
        placeholder: sdict.search,
        style: { ...inputStyle, flex: 1, minWidth: '120px' },
        onChange: (e: { target: { value: string } }) => setQuery(e.target.value),
        'data-dsh-plugin': 'ice-tools',
        'data-dsh-part': 'task-search',
      }),
      (['all', 'open', 'done', 'overdue'] as const).map((option) =>
        createElement('button', {
          key: option,
          type: 'button',
          style: {
            ...buttonStyle,
            padding: '2px 8px',
            fontSize: '12px',
            background: status === option ? 'var(--dsw-alias-bg-elevated, #ddd)' : undefined,
          },
          onClick: () => setStatus(option),
          'data-dsh-filter': option,
        }, sdict[`filter${option[0]!.toUpperCase()}${option.slice(1)}` as keyof typeof sdict] as string),
      ),
    ),
    createElement('div', { style: { display: 'flex', gap: '8px' } },
      createElement('button', {
        type: 'button',
        style: { ...buttonStyle, padding: '4px 8px', fontSize: '12px' },
        onClick: () => downloadExport(tasks, 'json'),
      }, sdict.exportJson),
      createElement('button', {
        type: 'button',
        style: { ...buttonStyle, padding: '4px 8px', fontSize: '12px' },
        onClick: () => downloadExport(tasks, 'markdown'),
      }, sdict.exportMarkdown),
    ),
    filtered.length === 0
      ? createElement('span', { style: noteStyle }, sdict.empty)
      : createElement('div', {
        style: { display: 'flex', flexDirection: 'column', gap: '4px' },
        'data-dsh-plugin': 'ice-tools',
        'data-dsh-part': 'task-list',
      },
        filtered.map((task, idx) => {
          const overdueFlag = isOverdue(task)
          const blockedFlag = isBlocked(task, tasks)
          return createElement('div', {
            key: task.id,
            style: {
              display: 'grid',
              gridTemplateColumns: 'auto auto 1fr auto auto auto auto auto',
              gap: '8px',
              alignItems: 'center',
              padding: '4px 8px',
              borderRadius: '6px',
              background: overdueFlag
                ? 'rgba(180, 35, 24, 0.08)'
                : 'var(--dsw-alias-bg-row, rgba(127,127,127,0.05))',
            },
            'data-dsh-task': task.id,
            'data-dsh-priority': task.priority,
            'data-dsh-overdue': overdueFlag ? 'true' : 'false',
            'data-dsh-blocked': blockedFlag ? 'true' : 'false',
          },
            createElement('input', {
              type: 'checkbox',
              checked: task.done,
              disabled: blockedFlag && !task.done,
              onChange: () => setTasks(toggleTask(tasks, task.id)),
            }),
            createElement('span', {
              style: {
                fontSize: '11px',
                fontWeight: 600,
                padding: '2px 6px',
                borderRadius: '4px',
                color: '#fff',
                background: priorityColor(task.priority),
              },
            }, sdict[`priority${task.priority[0]!.toUpperCase()}${task.priority.slice(1)}` as keyof typeof sdict] as string),
            createElement('span', {
              style: {
                fontSize: '13px',
                textDecoration: task.done ? 'line-through' : 'none',
                color: overdueFlag ? 'var(--dsw-alias-danger, #b42318)' : task.done ? 'var(--dsw-alias-label-secondary, #666)' : 'inherit',
              },
            }, task.title),
            createElement('input', {
              type: 'date',
              value: task.dueDate ?? '',
              style: { ...inputStyle, padding: '2px 6px', fontSize: '12px' },
              onChange: (e: { target: { value: string } }) => {
                const value = e.target.value
                setTasks(setDueDate(tasks, task.id, value === '' ? undefined : value))
              },
            }),
            createElement('span', { style: { fontSize: '11px', color: 'var(--dsw-alias-label-secondary, #666)' } },
              overdueFlag ? sdict.overdue : (blockedFlag ? sdict.blocked : ''),
            ),
            createElement('button', {
              type: 'button',
              style: { ...buttonStyle, padding: '2px 4px', fontSize: '11px' },
              disabled: idx === 0,
              onClick: () => setTasks(moveTask(tasks, task.id, -1)),
              'aria-label': sdict.moveUp,
            }, '↑'),
            createElement('button', {
              type: 'button',
              style: { ...buttonStyle, padding: '2px 4px', fontSize: '11px' },
              disabled: idx === filtered.length - 1,
              onClick: () => setTasks(moveTask(tasks, task.id, 1)),
              'aria-label': sdict.moveDown,
            }, '↓'),
            createElement('button', {
              type: 'button',
              style: { ...buttonStyle, padding: '2px 6px', fontSize: '12px' },
              onClick: () => setTasks(removeTask(tasks, task.id)),
            }, sdict.remove),
          )
        }),
      ),
  )
}

function priorityColor(priority: Priority): string {
  if (priority === 'high') return '#b42318'
  if (priority === 'medium') return '#a86b00'
  return '#5a6b73'
}

function downloadExport(tasks: readonly Task[], format: 'json' | 'markdown'): void {
  if (typeof window === 'undefined') return
  const content = format === 'json' ? exportJson(tasks) : exportMarkdown(tasks)
  const blob = new Blob([content], { type: format === 'json' ? 'application/json' : 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `dsh-ice-tools-tasks.${format}`
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  URL.revokeObjectURL(url)
}

function ChatRecoveryBlock({ dict }: { readonly dict: typeof zh }): ReactElement {
  const sdict = dict.chatRecovery
  const [entries, setEntries] = useState<readonly FailedSession[]>(() => loadFailedSessions())
  const [newId, setNewId] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [flash, setFlash] = useState<string | undefined>(undefined)
  const sorted = sortFailedSessions(entries)
  const onAdd = (): void => {
    setEntries(addFailedSession(entries, newId, newDesc))
    setNewId('')
    setNewDesc('')
    setFlash(sdict.added)
    if (typeof window !== 'undefined') {
      window.setTimeout(() => setFlash(undefined), 1500)
    }
  }
  const onStatus = (id: string, status: FailedSession['status']): void => {
    setEntries(markFailedSession(entries, id, status))
  }
  const onRemove = (id: string): void => {
    setEntries(removeFailedSession(entries, id))
  }
  const onCopy = (id: string): void => {
    void copyToClipboard(id).then(() => {
      setFlash(sdict.copied)
      if (typeof window !== 'undefined') {
        window.setTimeout(() => setFlash(undefined), 1500)
      }
    })
  }
  const onClear = (): void => {
    setEntries(clearFailedSessions())
    setFlash(sdict.cleared)
    if (typeof window !== 'undefined') {
      window.setTimeout(() => setFlash(undefined), 1500)
    }
  }
  const onExport = (): void => {
    const json = exportRecoveryJson(entries)
    if (typeof window === 'undefined') return
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'dsh-ice-tools-recovery.json'
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
    URL.revokeObjectURL(url)
  }
  const onImport = (raw: string): void => {
    const imported = importRecoveryJson(raw)
    if (typeof imported === 'string') {
      setFlash(imported)
    } else {
      setEntries(imported)
      setFlash(sdict.imported)
    }
    if (typeof window !== 'undefined') {
      window.setTimeout(() => setFlash(undefined), 2000)
    }
  }
  return createElement('div', {
    key: 'chat-recovery',
    style: { display: 'flex', flexDirection: 'column', gap: '8px', padding: '8px 0' },
    'data-dsh-plugin': 'ice-tools',
    'data-dsh-part': 'chat-recovery',
  },
    createElement('div', { style: { display: 'flex', gap: '8px', alignItems: 'center' } },
      createElement('span', { style: { fontWeight: 600 } }, sdict.title),
      createElement('button', {
        type: 'button',
        style: { ...buttonStyle, padding: '2px 8px', fontSize: '11px' },
        onClick: onClear,
        disabled: entries.length === 0,
        'data-dsh-plugin': 'ice-tools',
        'data-dsh-part': 'recovery-clear',
      }, sdict.clearAll),
      createElement('button', {
        type: 'button',
        style: { ...buttonStyle, padding: '2px 8px', fontSize: '11px' },
        onClick: onExport,
        disabled: entries.length === 0,
        'data-dsh-plugin': 'ice-tools',
        'data-dsh-part': 'recovery-export',
      }, sdict.exportJson),
    ),
    createElement('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap' } },
      createElement('input', {
        type: 'text',
        value: newId,
        placeholder: sdict.idPlaceholder,
        style: { ...inputStyle, flex: 1, minWidth: '120px' },
        onChange: (e: { target: { value: string } }) => setNewId(e.target.value),
        'aria-label': sdict.idLabel,
        'data-dsh-plugin': 'ice-tools',
        'data-dsh-part': 'recovery-id',
      }),
      createElement('input', {
        type: 'text',
        value: newDesc,
        placeholder: sdict.descriptionPlaceholder,
        style: { ...inputStyle, flex: 2, minWidth: '200px' },
        onChange: (e: { target: { value: string } }) => setNewDesc(e.target.value),
        'aria-label': sdict.descriptionLabel,
        'data-dsh-plugin': 'ice-tools',
        'data-dsh-part': 'recovery-description',
      }),
      createElement('button', {
        type: 'button',
        style: buttonStyle,
        onClick: onAdd,
        disabled: newId.trim().length === 0 || newDesc.trim().length === 0,
        'data-dsh-plugin': 'ice-tools',
        'data-dsh-part': 'recovery-add',
      }, sdict.add),
    ),
    sorted.length === 0
      ? createElement('span', { style: noteStyle }, sdict.empty)
      : createElement('div', {
        style: { display: 'flex', flexDirection: 'column', gap: '4px' },
        'data-dsh-plugin': 'ice-tools',
        'data-dsh-part': 'recovery-list',
      },
        sorted.map((entry) =>
          createElement('div', {
            key: entry.id,
            style: {
              display: 'grid',
              gridTemplateColumns: 'auto 1fr auto auto auto',
              gap: '8px',
              alignItems: 'center',
              padding: '6px 10px',
              borderRadius: '6px',
              background: entry.status === 'open' ? 'rgba(180, 35, 24, 0.08)' : 'var(--dsw-alias-bg-row, rgba(127,127,127,0.05))',
            },
            'data-dsh-recovery-id': entry.id,
            'data-dsh-recovery-status': entry.status,
          },
            createElement('span', {
              style: {
                fontSize: '11px',
                fontWeight: 600,
                padding: '2px 6px',
                borderRadius: '4px',
                color: entry.status === 'open' ? 'var(--dsw-alias-danger, #b42318)'
                  : entry.status === 'recovered' ? 'var(--dsw-alias-success, #0a7d2c)'
                  : 'var(--dsw-alias-label-secondary, #666)',
                background: entry.status === 'open' ? 'rgba(180, 35, 24, 0.15)'
                  : entry.status === 'recovered' ? 'rgba(10, 125, 44, 0.15)'
                  : 'rgba(127,127,127,0.15)',
              },
            }, entry.status === 'open' ? sdict.openStatus : entry.status === 'recovered' ? sdict.recoveredStatus : sdict.dismissedStatus),
            createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '2px' } },
              createElement('code', { style: { fontSize: '12px', fontFamily: 'var(--dsw-alias-font-mono, ui-monospace, monospace)' } }, entry.id),
              createElement('span', { style: { fontSize: '11px', color: 'var(--dsw-alias-label-secondary, #666)' } }, entry.description),
            ),
            createElement('button', {
              type: 'button',
              style: { ...buttonStyle, padding: '2px 6px', fontSize: '11px' },
              onClick: () => onCopy(entry.id),
            }, sdict.copy),
            createElement('button', {
              type: 'button',
              style: { ...buttonStyle, padding: '2px 6px', fontSize: '11px' },
              onClick: () => onStatus(entry.id, entry.status === 'open' ? 'recovered' : entry.status === 'recovered' ? 'dismissed' : 'open'),
            }, entry.status === 'open' ? sdict.markRecovered : entry.status === 'recovered' ? sdict.markDismissed : sdict.markOpen),
            createElement('button', {
              type: 'button',
              style: { ...buttonStyle, padding: '2px 6px', fontSize: '11px' },
              onClick: () => onRemove(entry.id),
            }, sdict.remove),
          ),
        ),
      ),
    flash
      ? createElement('span', { style: { ...noteStyle, color: 'var(--dsw-alias-success, #0a7d2c)' } }, flash)
      : null,
  )
}

function statusToLabel(status: FailedSession['status'], sdict: typeof zh.chatRecovery): string {
  return status === 'open' ? sdict.openStatus : status === 'recovered' ? sdict.recoveredStatus : sdict.dismissedStatus
}
void statusToLabel

const PATCH_PATH = '~/.dsh/profiles/web/cordis.patch.yml'

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
