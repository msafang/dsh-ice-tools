# Changelog

All notable changes to `dsh-ice-tools` are documented in this file. The
format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and the project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added
- **Tests**: a vitest suite covers every client-only surface (89 tests across
  dispatch, pluginManager, sessionId, desktopLauncher, taskBoard, and
  doctor). Smoke contracts for settingsHub and locale parity still ride
  alongside. The new tests pinned several behaviours the next refactor
  would otherwise have regressed silently.

### Changed
- **`normalizeEnabled`** now starts from an all-off section and opts-in
  through the input map, so an explicit non-boolean entry (null, the
  string `"yes"`, the integer `1`) cannot leak the on default past
  validation. The settingsHub toggle handler was already writing the
  full enabled map through `scope.set`, so no client-visible change.
- **`parseCordisPatch`** now accepts the flat-key form
  (`config:` + indented keys, no braces) as well as the JSON-ish
  `{ ... }` form. Real `cordis.patch.yml` files in the wild ship the
  flat form; the previous walker returned an empty string for it and
  the user saw no config fields even though the row had several.
- **`setDueDate`** treats the empty string from a wiped date input as a
  clear, matching the UI affordance. The previous contract required
  callers to pass `undefined`.
- **`safeStorage`** consults both `window.localStorage` and
  `globalThis.localStorage`, so test runners can inject a polyfill
  without monkey-patching the global. Production callers see no
  change.

### Fixed
- **`parseCordisPatch`** did not recognise source files that begin
  with `- insert:` (no leading newline) — the splitter expected a
  newline before the first keyword. Insert blocks landed in the wrong
  segment and rows were dropped silently.
- **`parseCordisPatch`** split on every `name:` keyword inside an insert
  segment, so a single block with two rows and a `name:` per row
  collapsed to a single row.
- **`parseCordisPatch`** returned the same source line for every row in
  a multi-row insert block, so duplicate-id detection reported both
  occurrences on the same line. The walker now advances a per-row
  cursor as it consumes the block.

## [0.1.0] - 2026-08-24

### Added
- **Initial release**: a bilingual DSH plugin that adds an **ICE Tools**
  page to the Web GUI settings panel and gathers host- and client-side
  utilities under one roof. Nine module toggles + eight in-page utility
  blocks: doctor diagnostics, the current session list with copy-to-
  clipboard, a local skill catalogue, a URL launcher that hands off to
  the system browser, a plugin-manager patch viewer, a placeholder for
  Git graph, a task list, and a placeholder for chat recovery.
- **Toggle gating**: every optional block renders only when its toggle
  is on. The `ice-tools` settings namespace is the single source of
  truth and survives restarts through the DSH settings provider.
- **In-page blocks**:
  - **Doctor**: thirteen checks against the live settings transport,
    locale runtime, bundle fingerprint, locale parity, the module
    loader, and a handful of platform APIs (clipboard, localStorage,
    fetch + AbortController).
  - **Session ID**: lists every Host-known session, supports
    copy-to-clipboard, rename, cancel, create (with optional cwd),
    status filter (All / Running / Idle), and copy-all.
  - **Skill Explorer**: a local catalogue of known skills with the
    ability to reveal the on-disk path.
  - **Desktop Launcher**: URL input with a hand-off to the system
    browser, ten-entry history persisted to localStorage, four quick
    presets, and a scheme filter.
  - **Plugin Manager**: parses `cordis.patch.yml` and renders the
    `insert:` rows with an expandable config map, duplicate-id
    detection, and a copy-path affordance.
  - **Task Board**: priority + due dates + blockers + search +
    templates + Markdown / JSON export, all persisted to
    localStorage.
  - **Git Graph / Chat Recovery**: placeholders that document the
    missing Host-side capability.
- **Page affordances**: a toggle guidance hint above the module list and
  a Reset to defaults button that uses `scope.unset('enabled')` to fall
  back to the composition `base` and schema defaults.
- **Defaults**: `doctor` and `sessionId` are on by default; the
  remaining six optional utilities are off until the user opts in.

### Notes
- The plugin does not depend on `@deepseek-ai/*` at runtime. The
  only declared peer dependency is `@deepseek-ai/schemastery`, which
  DSH already provides. Cordis-injected services carry the
  settings transport and the connection RPC; the client bundle uses
  them through untyped, narrow faces and never reaches across host
  fibers on its own.
- `cordis.patch.yml` rows the plugin parses are version-tracked in
  the loader, so the manager stays in sync with the loader's
  resolution without a host RPC.
- `taskBoard` keeps its data in `localStorage` so a single profile
  has a working checklist without depending on a cross-fiber write
  service.