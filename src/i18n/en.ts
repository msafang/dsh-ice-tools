import type { ModuleName } from '../core/dispatch/index.ts'
import type {
  ChatRecoveryDictionary,
  DesktopLauncherDictionary,
  DoctorDictionary,
  GitGraphDictionary,
  ModuleI18nEntry,
  PageHintsDictionary,
  PluginManagerDictionary,
  SessionIdDictionary,
  SkillExplorerDictionary,
  TaskBoardDictionary,
} from './zh.ts'

export type {
  ChatRecoveryDictionary,
  DesktopLauncherDictionary,
  DoctorDictionary,
  DoctorEntry,
  GitGraphDictionary,
  PageHintsDictionary,
  PluginManagerDictionary,
  SessionIdDictionary,
  SkillExplorerDictionary,
  TaskBoardDictionary,
} from './zh.ts'

export const en: {
  readonly modules: Record<ModuleName, ModuleI18nEntry>
  readonly doctor: DoctorDictionary
  readonly sessionId: SessionIdDictionary
  readonly skillExplorer: SkillExplorerDictionary
  readonly desktopLauncher: DesktopLauncherDictionary
  readonly pluginManager: PluginManagerDictionary
  readonly gitGraph: GitGraphDictionary
  readonly taskBoard: TaskBoardDictionary
  readonly chatRecovery: ChatRecoveryDictionary
  readonly pageHints: PageHintsDictionary
} = {
  modules: {
    settingsHub: { label: 'Settings Hub', description: 'Manage ICE Tools modules and sub-settings links.' },
    pluginManager: { label: 'Plugin Manager', description: 'Install, enable, and manage profile plugins.' },
    chatRecovery: { label: 'Chat Recovery', description: 'Provide a recovery entry for failed chats.' },
    desktopLauncher: { label: 'Desktop Launcher', description: 'Provide a desktop application launch entry.' },
    doctor: { label: 'Doctor', description: 'Check DSH environment and common configuration issues.' },
    sessionId: { label: 'Session ID', description: 'Show and help manage the current session identifier.' },
    skillExplorer: { label: 'Skill Explorer', description: 'Browse installed and available skills.' },
    gitGraph: { label: 'Git Graph', description: 'View workspace Git commit relationships.' },
    taskBoard: { label: 'Task Board', description: 'View and manage work tasks.' },
  },
  doctor: {
    title: 'Doctor',
    runButton: 'Run Doctor',
    running: 'Running…',
    pass: 'Pass',
    fail: 'Fail',
    checks: {
      connection: {
        label: 'Connection handle',
        detail: 'Settings transport reachable from this client.',
      },
      settingsDescribe: {
        label: 'settings.describe RPC',
        detail: 'The Host settings provider answered a describe request.',
      },
      namespaceRegistered: {
        label: 'ice-tools namespace',
        detail: 'The Host registered the ice-tools settings namespace.',
      },
      schemaSerializable: {
        label: 'Schema serializable',
        detail: 'The namespace schema.toJSON() returned a usable envelope.',
      },
      providerWritable: {
        label: 'Provider writable',
        detail: 'The settings provider accepts writes from this process.',
      },
      localeActive: {
        label: 'Locale active',
        detail: 'A locale snapshot is held in the client runtime.',
      },
      enabledKeys: {
        label: 'Enabled keys',
        detail: 'The resolved section has every module key present.',
      },
      bundleHash: {
        label: 'Bundle fingerprint',
        detail: 'Current dist/client.js matches the locally recorded hash; no stale cache.',
      },
      localeCoverage: {
        label: 'Locale coverage',
        detail: 'The Chinese and English dictionaries cover the same module keys.',
      },
      moduleLoader: {
        label: 'Module loader',
        detail: 'window.__ModuleLoader__ has registered the dsh-ice-tools factory.',
      },
      clipboardApi: {
        label: 'Clipboard API',
        detail: 'navigator.clipboard.writeText is available for the Session ID copy button.',
      },
      localStorageApi: {
        label: 'localStorage API',
        detail: 'Read/write localStorage works; required by task board and bundle fingerprint.',
      },
      fetchApi: {
        label: 'fetch API',
        detail: 'fetch + AbortController present; required by the connection RPC.',
      },
    },
  },
  sessionId: {
    title: 'Session ID',
    refresh: 'Refresh',
    copy: 'Copy',
    copied: 'Copied',
    copyFailed: 'Copy failed',
    empty: 'No sessions yet.',
    running: 'Running',
    idle: 'Idle',
  },
  skillExplorer: {
    title: 'Skill Explorer',
    location: 'Path',
    empty: 'No skills.',
  },
  desktopLauncher: {
    title: 'Desktop Launcher',
    placeholder: 'https://... or mailto:...',
    open: 'Open',
    hint: 'Copied to clipboard; paste in your system browser to open.',
    unsupported: 'Unsupported URL scheme.',
    historyEmpty: 'No history for this scheme.',
    remove: 'Remove',
  },
  pluginManager: {
    title: 'Plugin Manager',
    empty: 'No extra patch rows.',
  },
  gitGraph: {
    title: 'Git Graph',
    note: 'A Host-side git subprocess service is required to render the graph.',
  },
  taskBoard: {
    title: 'Task Board',
    placeholder: 'New task...',
    add: 'Add',
    done: 'Done',
    remove: 'Remove',
    empty: 'No tasks yet.',
    priority: 'Priority',
    priorityHigh: 'High',
    priorityMedium: 'Medium',
    priorityLow: 'Low',
    search: 'Search tasks...',
    filterAll: 'All',
    filterOpen: 'Open',
    filterDone: 'Done',
    filterOverdue: 'Overdue',
    overdue: 'Overdue',
    blocked: 'Blocked',
    moveUp: 'Move up',
    moveDown: 'Move down',
    exportJson: 'Export JSON',
    exportMarkdown: 'Export Markdown',
  },
  chatRecovery: {
    title: 'Chat Recovery',
    note: 'A Host-side failure event stream is required to list recoverable sessions.',
  },
  pageHints: {
    toggleGuidance: 'Toggle a row above to enable its block below; untoggle to hide it.',
    resetButton: 'Reset to defaults',
    resetConfirm: 'Reset will clear your current toggle overrides. Continue?',
    resetDone: 'Reset complete.',
  },
}