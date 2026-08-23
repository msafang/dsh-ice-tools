# dsh-ice-tools

`dsh-ice-tools` is a lean bilingual settings hub for DeepSeek Harness (DSH). It provides one ICE Tools entry under Settings, keeps module enablement in a small file-backed configuration, and supplies a real settings hub plus eight intentionally small runtime stubs for later phases.

## Installation

Local checkout:

```text
dsh plugin --profile web add link:D:\AICoding\DSH\dsh-ice-tools
```

GitHub checkout:

```text
dsh plugin --profile web add github:msafang/dsh-ice-tools
```

For a GitHub install, pnpm may block the package `prepare` build under its `allowBuilds` policy. Following the upstream DSH documentation, add the exact printed package key to the profile's one-shot `pnpm-workspace.yaml` allowance:

```yaml
allowBuilds:
  dsh-ice-tools: true
```

Re-run the install after adding the allowance. Only allow source builds you trust; pin a commit when using a production profile.

After installation, open Settings and locate `ICE Tools` / `ICE 工具`. Toggle modules there. The settings hub remains available, and optional module changes are picked up on the next dispatch tick without a DSH restart.

The file-backed configuration is `~/.dsh/dsh-ice-tools.json` with the shape `{ "enabled": { ... } }`. The package does not depend on `@deepseek-ai/*` at runtime; DSH supplies host services through Cordis injection.

## Modules

| Module | Status |
| --- | --- |
| settingsHub | Implemented settings section and toggle card |
| pluginManager | Stub |
| chatRecovery | Stub |
| desktopLauncher | Stub |
| doctor | Stub |
| sessionId | Stub |
| skillExplorer | Stub |
| gitGraph | Stub |
| taskBoard | Stub |

## License

Apache-2.0.
