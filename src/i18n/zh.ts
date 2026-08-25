import type { ModuleName } from '../core/dispatch/index.ts'

export interface ModuleI18nEntry {
  readonly label: string
  readonly description: string
}

export interface DoctorEntry {
  readonly label: string
  readonly detail: string
}

export interface DoctorDictionary {
  readonly title: string
  readonly runButton: string
  readonly running: string
  readonly pass: string
  readonly fail: string
  readonly checks: {
    readonly connection: DoctorEntry
    readonly settingsDescribe: DoctorEntry
    readonly namespaceRegistered: DoctorEntry
    readonly schemaSerializable: DoctorEntry
    readonly providerWritable: DoctorEntry
    readonly localeActive: DoctorEntry
    readonly enabledKeys: DoctorEntry
  }
}

export interface SessionIdDictionary {
  readonly title: string
  readonly refresh: string
  readonly copy: string
  readonly copied: string
  readonly copyFailed: string
  readonly empty: string
  readonly running: string
  readonly idle: string
}

export const sessionId: SessionIdDictionary = {
  title: '会话 ID',
  refresh: '刷新',
  copy: '复制',
  copied: '已复制',
  copyFailed: '复制失败',
  empty: '没有会话。',
  running: '运行中',
  idle: '空闲',
}

export const doctor: DoctorDictionary = {
  title: '诊断',
  runButton: '运行诊断',
  running: '运行中…',
  pass: '通过',
  fail: '失败',
  checks: {
    connection: {
      label: '连接句柄',
      detail: '客户端可达 settings transport。',
    },
    settingsDescribe: {
      label: 'settings.describe RPC',
      detail: 'Host settings provider 响应了 describe 请求。',
    },
    namespaceRegistered: {
      label: 'ice-tools namespace',
      detail: 'Host 注册了 ice-tools settings namespace。',
    },
    schemaSerializable: {
      label: 'Schema 可序列化',
      detail: 'namespace schema.toJSON() 返回了可用的信封。',
    },
    providerWritable: {
      label: 'Provider 可写',
      detail: 'settings provider 接受本进程的写入。',
    },
    localeActive: {
      label: 'Locale 已激活',
      detail: 'client runtime 持有 locale 快照。',
    },
    enabledKeys: {
      label: 'Enabled 键完整',
      detail: '解析后的 section 包含所有模块键。',
    },
  },
}

export const zh: {
  readonly modules: Record<ModuleName, ModuleI18nEntry>
  readonly doctor: DoctorDictionary
  readonly sessionId: SessionIdDictionary
} = {
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
  doctor,
  sessionId,
}