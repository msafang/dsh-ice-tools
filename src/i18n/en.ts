import type { ModuleName } from '../core/dispatch/index.ts'
import type { DoctorDictionary, ModuleI18nEntry } from './zh.ts'

export type { DoctorDictionary, DoctorEntry } from './zh.ts'

export const en: { readonly modules: Record<ModuleName, ModuleI18nEntry>; readonly doctor: DoctorDictionary } = {
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
    },
  },
}