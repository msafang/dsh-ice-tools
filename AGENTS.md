# Package-local agent rules

- Keep this package self-contained and keep changes inside this directory.
- Do not add runtime dependencies on `@deepseek-ai/*`; use the typed adapter and injected Cordis services.
- Keep browser imports platform-pure and keep the semantic attributes documented in `shared/contracts/semantic-attrs-v1.md`.
- Do not commit secrets, local profiles, or generated files other than the tracked `dist/` build output.
- Use Conventional Commits and run `pnpm typecheck`, `pnpm test`, and `pnpm build` before reporting a completed change.
