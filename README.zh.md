# dsh-ice-tools

`dsh-ice-tools` 是一个面向 DeepSeek Harness（DSH）的精简双语设置中心。它在设置中提供一个 ICE 工具入口，把模块开关保存在文件中，并提供一个真实可用的设置中心以及八个为后续阶段保留的运行时 stub。

## 安装

本地 checkout：

```text
dsh plugin --profile web add link:D:\AICoding\DSH\dsh-ice-tools
```

GitHub checkout：

```text
dsh plugin --profile web add github:msafang/dsh-ice-tools
```

从 GitHub 安装时，pnpm 可能会根据 `allowBuilds` 策略阻止包的 `prepare` 构建。按照上游 DSH 文档，在 profile 的 `pnpm-workspace.yaml` 中一次性加入终端输出的准确包名：

```yaml
allowBuilds:
  dsh-ice-tools: true
```

加入后重新执行安装。只允许你信任的源码构建；生产 profile 建议固定 Git commit。

安装后，打开设置，找到 `ICE 工具` / `ICE Tools`。在这里切换模块。设置中心始终保留，其他模块的开关会在下一次 dispatch tick 生效，不需要重启 DSH。

文件配置位于 `~/.dsh/dsh-ice-tools.json`，结构为 `{ "enabled": { ... } }`。本包不在运行时依赖 `@deepseek-ai/*`，host 服务通过 Cordis 注入提供。

## 模块

| 模块 | 当前状态 |
| --- | --- |
| settingsHub | 已实现设置区和开关卡片 |
| pluginManager | Stub |
| chatRecovery | Stub |
| desktopLauncher | Stub |
| doctor | Stub |
| sessionId | Stub |
| skillExplorer | Stub |
| gitGraph | Stub |
| taskBoard | Stub |

## 许可证

Apache-2.0。
