# dsh-ice-tools

`dsh-ice-tools` 是一个面向 DeepSeek Harness（DSH）的双语工具插件。它在
Web GUI 的设置面板里新增了一个 **ICE 工具** 页面，把 host 端和 client 端
的实用工具集中在一处。该页面渲染九个模块开关，加上八个内嵌工具区块：
doctor 诊断、当前会话列表（带一键复制）、本地技能目录、把 URL 复制到
剪贴板后交给系统浏览器打开的桌面启动器、插件管理的 patch 浏览器，以及
三个标注「需要 Host 提供 hook」的占位区块。

## 安装

本地 checkout：

```text
dsh plugin --profile web add link:D:\AICoding\DSH\dsh-ice-tools
```

GitHub checkout：

```text
dsh plugin --profile web add github:msafang/dsh-ice-tools
```

从 GitHub 安装时，pnpm 可能会根据 `allowBuilds` 策略阻止包的 `prepare`
构建。按照上游 DSH 文档，在 profile 的 `pnpm-workspace.yaml` 中一次性
加入终端输出的准确包名：

```yaml
allowBuilds:
  dsh-ice-tools: true
```

加入后重新执行安装。只允许你信任的源码构建；生产 profile 建议固定
Git commit。

安装后，打开 DSH Web GUI 设置面板，找到 **ICE 工具** 入口。ICE 工具页
面里会列出所有模块，并允许你开关可选工具；设置页面本身始终可用。
模块开关通过 DSH 设置服务持久化，重启后保留。

本包不在运行时依赖 `@deepseek-ai/*`，host 服务通过 Cordis 注入提供。
唯一声明的 peer 依赖是 `@deepseek-ai/schemastery`——DSH 运行时已经
提供，本包不会主动跨 host/client fiber 调用。

## 模块与区块

### 开关（host 端 enabled 标记）

| 模块 | 是否可开关 | 说明 |
| --- | --- | --- |
| 设置中心 (settingsHub) | 始终启用 | 设置页面本身 |
| 诊断工具 (doctor) | 可选 | "运行诊断"按钮，探测实时 DSH 运行时 |
| 会话 ID (sessionId) | 可选 | 列出 Host 已知的会话，一键复制 id |
| 技能浏览器 (skillExplorer) | 可选 | 渲染本插件已知的技能列表 |
| 桌面启动器 (desktopLauncher) | 可选 | URL 输入 + Open 按钮，把 URL 写入剪贴板交给系统浏览器 |
| 插件管理 (pluginManager) | 可选 | 解析 profile patch，展示已装行 |
| Git 图谱 (gitGraph) | 可选 | 粘贴 `git log --graph --oneline` 输出在块里渲染 |
| 任务看板 (taskBoard) | 可选 | 客户端任务列表，持久化到 localStorage |
| 对话恢复 (chatRecovery) | 可选 | 手动记录失败会话（状态胶囊、JSON 导出/导入、localStorage 持久化） |

开关统一在 `ice-tools` 设置 namespace 下，通过单一 settings scope
读取。toggle 切换会持久化，并在下次 dispatch tick 生效，不需要重启
DSH。

### 内嵌区块（始终渲染）

ICE 工具页面还渲染不绑定开关的区块：

- **诊断工具** — 「运行诊断」跑十三项检查，探测实时 settings transport、
  locale runtime、bundle 指纹、双语字典覆盖、模块加载器、剪贴板 API、
  localStorage 与 fetch + AbortController。
- **会话 ID** — 「刷新」拉取会话目录，每个会话渲染一行，附带复制按钮，
  把 id 写入剪贴板。
- **技能浏览器** — 通过只读 `ice-tools-skills` namespace 镜像本机
  `~/.dsh/skills/` 目录，每条 skill 读取 `SKILL.md` 第一段作为描述。
- **桌面启动器** — URL 输入 + Open 按钮；Open 校验 scheme 后把 URL
  复制到剪贴板，由用户在系统浏览器中打开。
- **插件管理** — 读取 `cordis.patch.yml` 并展示 `insert:` 行。
- **Git 图谱** — 粘贴 `git log --graph --oneline` 输出，渲染成按 kind
  着色的网格 + 顶部统计行。
- **任务看板** — 增/勾/删任务，持久化到 localStorage，键名
  `dsh-ice-tools.tasks.v1`。
- **对话恢复** — 手动记录失败会话：状态胶囊（未解决 / 已恢复 / 已关闭）、
  复制按钮、JSON 导出 / 导入，持久化到 localStorage。

## 许可证

Apache-2.0。