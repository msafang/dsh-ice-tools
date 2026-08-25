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
    readonly bundleHash: DoctorEntry
    readonly localeCoverage: DoctorEntry
    readonly moduleLoader: DoctorEntry
    readonly clipboardApi: DoctorEntry
    readonly localStorageApi: DoctorEntry
    readonly fetchApi: DoctorEntry
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

export interface SkillExplorerDictionary {
  readonly title: string
  readonly location: string
  readonly empty: string
}

export const skillExplorer: SkillExplorerDictionary = {
  title: '技能浏览器',
  location: '路径',
  empty: '没有技能。',
}

export interface DesktopLauncherDictionary {
  readonly title: string
  readonly placeholder: string
  readonly open: string
  readonly hint: string
  readonly unsupported: string
}

export const desktopLauncher: DesktopLauncherDictionary = {
  title: '桌面启动器',
  placeholder: 'https://... 或 mailto:...',
  open: '打开',
  hint: '已复制到剪贴板，请在系统浏览器中打开。',
  unsupported: '不支持的 URL 协议。',
}

export interface PluginManagerDictionary {
  readonly title: string
  readonly empty: string
}

export const pluginManager: PluginManagerDictionary = {
  title: '插件管理',
  empty: '未发现额外 patch 行。',
}

export interface GitGraphDictionary {
  readonly title: string
  readonly note: string
}

export const gitGraph: GitGraphDictionary = {
  title: 'Git 图谱',
  note: '需要 Host 提供 git 子进程服务才能渲染图谱。',
}

export interface TaskBoardDictionary {
  readonly title: string
  readonly placeholder: string
  readonly add: string
  readonly done: string
  readonly remove: string
  readonly empty: string
}

export const taskBoard: TaskBoardDictionary = {
  title: '任务看板',
  placeholder: '新任务...',
  add: '添加',
  done: '完成',
  remove: '删除',
  empty: '没有任务。',
}

export interface ChatRecoveryDictionary {
  readonly title: string
  readonly note: string
}

export const chatRecovery: ChatRecoveryDictionary = {
  title: '对话恢复',
  note: '需要 Host 提供失败会话事件流才能列出可恢复项。',
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
    bundleHash: {
      label: 'Bundle 指纹',
      detail: '当前 dist/client.js 与本地记录一致，避免缓存陈旧包。',
    },
    localeCoverage: {
      label: '双语字典覆盖',
      detail: '中文与英文字典模块键完全对齐。',
    },
    moduleLoader: {
      label: '模块加载器',
      detail: 'window.__ModuleLoader__ 已注册 dsh-ice-tools 工厂。',
    },
    clipboardApi: {
      label: '剪贴板 API',
      detail: 'navigator.clipboard.writeText 可用于复制会话 ID。',
    },
    localStorageApi: {
      label: 'localStorage API',
      detail: '可读写 localStorage，用于任务看板与 bundle 指纹。',
    },
    fetchApi: {
      label: 'fetch API',
      detail: 'fetch + AbortController 可用，连接 RPC 依赖此基元。',
    },
  },
}

export const zh: {
  readonly modules: Record<ModuleName, ModuleI18nEntry>
  readonly doctor: DoctorDictionary
  readonly sessionId: SessionIdDictionary
  readonly skillExplorer: SkillExplorerDictionary
  readonly desktopLauncher: DesktopLauncherDictionary
  readonly pluginManager: PluginManagerDictionary
  readonly gitGraph: GitGraphDictionary
  readonly taskBoard: TaskBoardDictionary
  readonly chatRecovery: ChatRecoveryDictionary
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
  skillExplorer,
  desktopLauncher,
  pluginManager,
  gitGraph,
  taskBoard,
  chatRecovery,
}