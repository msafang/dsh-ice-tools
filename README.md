# dsh-ice-tools

`dsh-ice-tools` is a bilingual utility plugin for DeepSeek Harness (DSH).
It adds an **ICE Tools** page to the Web GUI's settings surface and gathers
host- and client-side utilities under one roof. The page renders nine
module toggles plus eight in-page utility blocks: doctor diagnostics, the
current session list with copy-to-clipboard, a local skill catalogue, a URL
launcher that hands off to the system browser, a plugin-manager patch
viewer, and three blocks that surface a "Host hook required" note when
their capability needs a cross-fiber service the plugin does not own
today.

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
printed package key to the profile's one-shot `pnpm-workspace.yaml`
allowance:

```yaml
allowBuilds:
  dsh-ice-tools: true
```

Re-run the install after adding the allowance. Only allow source builds you
trust; pin a commit when using a production profile.

After installation, open the DSH Web GUI Settings panel and select the
**ICE Tools** section. The settings surface inside ICE Tools lists every
module and lets you toggle optional utilities on and off; the settings
page itself stays available unconditionally. Enablement is persisted
through the DSH settings provider and survives restarts.

The package does not depend on `@deepseek-ai/*` at runtime; DSH supplies
host services through Cordis injection. The only peer dependency the
package declares is `@deepseek-ai/schemastery`, which DSH already provides
at runtime; the package never directly reaches across host-client fibers
on its own.

## Modules and blocks

### Toggles (host-side enabled flag)

| Module | Toggleable | Notes |
| --- | --- | --- |
| settingsHub | always on | The settings page itself |
| doctor | optional | A "Run Doctor" button that probes the live DSH runtime |
| sessionId | optional | Lists sessions known to the Host with one-click copy |
| skillExplorer | optional | Renders a local catalogue of known skills |
| desktopLauncher | optional | URL input + clipboard handoff to the system browser |
| pluginManager | optional | Parses the profile patch and shows installed rows |
| gitGraph | optional | Placeholder; awaits a Host git subprocess service |
| taskBoard | optional | Client-side task list backed by localStorage |
| chatRecovery | optional | Placeholder; awaits a Host failure event stream |

The toggle gate is unified: every toggle lives in the `ice-tools` settings
namespace and is read through a single settings scope. A change to a
toggle survives restarts and propagates to the next dispatch tick without
a DSH restart.

### In-page blocks (always rendered)

The ICE Tools page also renders blocks that do not take a module toggle:

- **Doctor** — `Run Doctor` runs seven checks against the live settings
  transport, locale runtime, and the resolved `ice-tools` section.
- **Session ID** — `Refresh` pulls the session catalog and renders one row
  per session with a Copy button that puts the id on the clipboard.
- **Skill Explorer** — Static catalogue of skills the plugin knows about.
- **Desktop Launcher** — URL input + Open button; Open validates the
  scheme and copies the URL to the clipboard as a hand-off to the
  system browser.
- **Plugin Manager** — Reads `cordis.patch.yml` and renders the
  `insert:` rows.
- **Git Graph** — Notes the missing Host hook.
- **Task Board** — Add / toggle / remove tasks, persisted to
  `localStorage` under the key `dsh-ice-tools.tasks.v1`.
- **Chat Recovery** — Notes the missing Host hook.

## License

Apache-2.0.