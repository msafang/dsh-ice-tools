import type { ModuleName } from '../core/dispatch/index.ts'
import type { ModuleI18nEntry } from './zh.ts'

export const en: { readonly modules: Record<ModuleName, ModuleI18nEntry> } = {
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
}
