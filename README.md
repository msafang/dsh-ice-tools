# dsh-ice-tools

`dsh-ice-tools` is a bilingual utility plugin for DeepSeek Harness (DSH). It
exposes a single **ICE Tools** top-level menu entry in the Web GUI, gathers
host- and client-side utilities under one roof, and ships with a real
settings surface plus eight small tools that can be enabled independently.

## Installation

Local checkout:

```text
dsh plugin --profile web add link:D:\AICoding\DSH\dsh-ice-tools
```

GitHub checkout:

```text
dsh plugin --profile web add github:msafang/dsh-ice-tools
```

For a GitHub install, pnpm may block the package `prepare` build under its
`allowBuilds` policy. Following the upstream DSH documentation, add the exact
printed package key to the profile's one-shot `pnpm-workspace.yaml` allowance:

```yaml
allowBuilds:
  dsh-ice-tools: true
```

Re-run the install after adding the allowance. Only allow source builds you
trust; pin a commit when using a production profile.

After installation, open the DSH Web GUI and locate the **ICE Tools** menu
entry. The settings surface inside ICE Tools lists every module and lets you
toggle optional tools on and off; the settings page itself stays available
unconditionally. Enablement is persisted through the DSH settings provider
and survives restarts.

The package does not depend on `@deepseek-ai/*` at runtime; DSH supplies host
services through Cordis injection.

## Modules

| Module | Status | Notes |
| --- | --- | --- |
| settingsHub | Implemented | Bilingual settings section, toggle card, and persistence |
| doctor | Planned | Run environment checks from the ICE Tools page |
| sessionId | Planned | Copy the current session id from the conversation header |
| skillExplorer | Planned | Browse installed skills |
| desktopLauncher | Planned | Open external targets from the ICE Tools page |
| pluginManager | Planned | Inspect and toggle profile plugins |
| gitGraph | Planned | Render `git log --graph` from the ICE Tools page |
| taskBoard | Planned | Lightweight task list backed by `~/.dsh/tasks.json` |
| chatRecovery | Planned | Recover from a failed chat turn |

## License

Apache-2.0.
