import type { ModuleName } from '../core/dispatch/index.ts'

export interface ModuleI18nEntry {
  readonly label: string
  readonly description: string
}

export const zh: { readonly modules: Record<ModuleName, ModuleI18nEntry> } = {
  modules: {
    settingsHub: { label: '设置中心', description: '管理 ICE 工具模块和子设置入口。' },
    pluginManager: { label: '插件管理', description: '插件安装、启用和 profile 管理。' },
    chatRecovery: { label: '对话恢复', description: '为失败的对话提供恢复入口。' },
    desktopLauncher: { label: '桌面启动器', description: '提供桌面应用启动入口。' },
    doctor: { label: '诊断工具', description: '检查 DSH 环境和常见配置问题。' },
    sessionId: { label: '会话 ID', description: '展示和辅助管理当前会话标识。' },
    skillExplorer: { label: '技能浏览器', description: '浏览已安装和可用的技能。' },
    gitGraph: { label: 'Git 图谱', description: '查看工作区 Git 提交关系。' },
    taskBoard: { label: '任务看板', description: '查看和管理工作任务。' },
  },
}
