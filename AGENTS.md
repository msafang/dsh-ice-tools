# Package-local agent rules

## Scope

- Keep this package self-contained and keep changes inside this directory.
- Do not add runtime dependencies on `@deepseek-ai/*`; use the typed adapter
  and injected Cordis services.
- Keep browser imports platform-pure and keep the semantic attributes
  documented in `shared/contracts/semantic-attrs-v1.md`.
- Do not commit secrets, local profiles, or generated files other than the
  tracked `dist/` build output.
- Use Conventional Commits and run `pnpm typecheck`, `pnpm test`, and
  `pnpm build` before reporting a completed change.

## Tests

- New client-side reducers and parsers must land a unit test in
  `tests/<module>.test.ts` that exercises the public surface and the
  boundary cases (empty input, malformed input, boundary values).
- The smoke test (`tests/smoke.test.ts`) owns the host-side registration
  contract; new host-side registration steps must keep it passing.
- When a test reveals a bug in shared code, fix the bug in the same commit
  that lands the test so the next refactor does not regress.

## Documentation

- README.md / README.zh.md stay in lock-step; the README.i18n.yaml entry
  pairs them so the two halves do not drift.
- CHANGELOG.md follows Keep a Changelog 1.1 and lives next to the README.
  Every user-visible change gets an entry under [Unreleased]; a version
  bump rolls [Unreleased] into a dated section.
- `shared/contracts/semantic-attrs-v1.md` documents every
  `data-dsh-part` value emitted by the plugin. New UI surfaces register
  their parts there before the code lands.

## i18n

- The bilingual dictionaries (`src/i18n/{en,zh}.ts`) must keep the same
  key set per namespace. The localeCoverage doctor check enforces parity;
  missing keys fail the run and block the release.
- New dictionary entries follow the existing namespace shape: `title`,
  `placeholder`, `add`, `empty`, and per-action labels. Long-form copy
  goes through the doctor detail field, not the label.

## Client bundle shape

- The client bundle ships as `dist/client.js` wrapped by
  `window.__ModuleLoader__.load({ id, factory })` (see
  `shared/tsdown.client.ts`). The wrapper is what the DSH loader uses to
  register the plugin.
- `minify: true` and `sourcemap: false` on both halves. The maps stay
  useful during development but do not ship in the npm payload; the
  comments in the bundle carry the line numbers the loader needs.
- `package.json#files` lists `dist/client.js` and `dist/index.js`
  explicitly so the tarball stays small.

## Settings surface

- The settings namespace `ice-tools` is the single source of truth for
  module toggles. `settingsHub` is always on and non-toggleable; the
  other eight are opt-in.
- New modules register their UI through the settingsHub page rather than
  the global shell slots. A page-level block owns its own React state and
  subscribes to the settings scope through `scope.subscribe` so toggles
  take effect without remounting.