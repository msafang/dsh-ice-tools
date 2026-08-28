# Semantic attributes v1

The package uses the L2 semantic attribute convention. The root owner is
always explicit, and child parts use bare values owned by that root.

## Root

```html
<section data-dsh-plugin="ice-tools">
```

The root value is the short package owner `ice-tools`, not the npm package
name.

## Part enum

The current part values are organised by surface so the reader knows which
block owns each piece. New parts must keep the `data-dsh-part="..."` shape
and stay bare (no `ice-tools:` prefix); the parent `data-dsh-plugin`
already establishes ownership.

### settings page

- `settings-card` — the static card shell emitted by `renderSettingsCard`
  for pre-flight checks.
- `settings-header` — the header row above the toggle list (guidance hint,
  search input, reset button).
- `settings-row` — one toggle row inside the list.
- `settings-search` — the inline search input on the header row.
- `settings-reset` — the Reset-to-defaults button on the header row.
- `block-wrapper` — the collapse/expand wrapper around every gated block
  (carries `data-dsh-collapsed="true|false"`).

### doctor block

- `doctor` — the block container.
- `doctor-run` — the initial Run Doctor button.
- `doctor-rerun` — the inline Rerun button that appears after the first
  result.
- `doctor-results` — the list of check results.
- `doctor-history` — the running-history table under the results.

### sessionId block

- `session-id` — the block container.
- `session-refresh` — the Refresh button.
- `session-copy-all` — the Copy-all button.
- `session-cwd` — the cwd input that feeds `sessions.create`.
- `session-create` — the New session button.
- `session-list` — the per-session rows.

### skillExplorer block

- `skill-explorer` — the block container.
- `skill-source` — the "Live mirror" / "Static fallback" caption.
- `skill-list` — the per-skill rows.

### desktopLauncher block

- `desktop-launcher` — the block container.
- `launcher-history` — the history table under the input row.

### pluginManager block

- `plugin-manager` — the block container.
- `plugin-source` — the monospace path caption.
- `plugin-copy-path` — the Copy path button.
- `plugin-duplicates` — the duplicates banner (rendered only when two
  insert rows share the same id).
- `plugin-rows` — the list of parsed insert rows.
- `plugin-row-config` — the expandable config map under each row.

### gitGraph block

- `git-graph` — the block container.
- `git-graph-input` — the textarea that accepts the pasted log output.
- `git-graph-output` — the rendered grid under the textarea.

### taskBoard block

- `task-board` — the block container.
- `task-search` — the inline search input above the list.
- `task-list` — the per-task rows.

### chatRecovery block

- `chat-recovery` — the block container.
- `recovery-clear` — the Clear-all button.
- `recovery-export` — the Export JSON button.
- `recovery-id` — the session-id input in the new-entry row.
- `recovery-description` — the description input in the new-entry row.
- `recovery-add` — the Add button in the new-entry row.
- `recovery-list` — the per-failure rows.
