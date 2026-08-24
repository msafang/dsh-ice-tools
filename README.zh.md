# dsh-ice-tools

`dsh-ice-tools` 是一个面向 DeepSeek Harness（DSH）的双语工具插件。它在
Web GUI 里暴露一个 **ICE 工具** 顶级菜单入口，把 host 端和 client 端的
实用工具集中在一处，并带有一个真实的设置面板和八个可以独立开关的小工具。

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

安装后，打开 DSH Web GUI，找到 **ICE 工具** 菜单。ICE 工具里的设置面板
会列出所有模块，允许你开关可选工具；设置面板本身始终可用。模块开关通过
DSH 设置服务持久化，重启后保留。

本包不在运行时依赖 `@deepseek-ai/*`，host 服务通过 Cordis 注入提供。

## 模块

| 模块 | 当前状态 | 说明 |
| --- | --- | --- |
| 设置中心 (settingsHub) | 已实现 | 双语设置面板、开关卡片、持久化 |
| 诊断工具 (doctor) | 计划中 | 在 ICE 工具页运行环境检查 |
| 会话 ID (sessionId) | 计划中 | 在会话 header 复制当前会话 id |
| 技能浏览器 (skillExplorer) | 计划中 | 浏览已装技能 |
| 桌面启动器 (desktopLauncher) | 计划中 | 从 ICE 工具页打开外部目标 |
| 插件管理 (pluginManager) | 计划中 | 查看并开关 profile 插件 |
| Git 图谱 (gitGraph) | 计划中 | 在 ICE 工具页渲染 `git log --graph` |
| 任务看板 (taskBoard) | 计划中 | 基于 `~/.dsh/tasks.json` 的轻量任务列表 |
| 对话恢复 (chatRecovery) | 计划中 | 从失败的对话恢复 |

## 许可证

Apache-2.0。
