import type { HostContext } from '../../core/dsh-adapter/index.ts'
import { DEFAULT_ENABLED, normalizeEnabled, type IceConfig } from '../../core/dispatch/index.ts'
import Schema from '@deepseek-ai/schemastery'

export const name = 'ice-settings-hub'
export const stubOnly = false
export const descriptionKey = 'modules.settingsHub.description'

/**
 * The settings schema for the `ice-tools` namespace. Schemastery is the same
 * DSL the upstream SettingsProvider registers against, so the provider can
 * validate writes and serialize via `toJSON()` for the configuration surface.
 *
 * `enabled` is a permissive dict: any module key is accepted with a boolean
 * value. `normalizeEnabled` is the canonical source of truth for the
 * settingsHub lock and missing-key defaults.
 */
export const Config = Schema.object({
  enabled: Schema.dict(Schema.boolean()),
})

export const defaults: IceConfig = {
  enabled: { ...DEFAULT_ENABLED },
}

/**
 * A read-only mirror of the `~/.dsh/skills/` directory. The host side populates
 * this namespace at apply time; the client side reads it through the
 * settings scope. The mirror lets the Skill Explorer block render real
 * installed skills without taking a runtime dependency on a session-scoped
 * skills RPC.
 */
export interface SkillsMirror {
  readonly entries: readonly { readonly name: string; readonly description: string }[]
  readonly generatedAt: number
}

export const SkillsDefaults: SkillsMirror = {
  entries: [],
  generatedAt: 0,
}

export const SkillsConfig = Schema.object({
  entries: Schema.array(Schema.object({
    name: Schema.string(),
    description: Schema.string(),
  })),
  generatedAt: Schema.number(),
})

/** Resolve `~/.dsh/skills/` relative to the runtime home directory. */
function resolveSkillsDir(homeDir: string | undefined): string | undefined {
  const cwd = process.cwd()
  const candidates = [
    homeDir,
    process.env['DSH_HOME'],
    cwd,
  ].filter((value): value is string => typeof value === 'string' && value.length > 0)
  if (candidates.length === 0) return undefined
  // Prefer the first candidate; the caller does the fallback.
  return candidates[0]
}

/** Walk one level of the skills directory and produce a minimal mirror. */
function readSkillsMirror(homeDir: string | undefined): SkillsMirror {
  const baseDir = resolveSkillsDir(homeDir)
  if (baseDir === undefined) return SkillsDefaults
  // node:fs is only available in the host runtime. We do not import it at
  // the top level so that future bundling changes (e.g. running the host
  // half through an esbuild rule that drops node:*) surface a precise
  // require error at apply time instead of a build-time one.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { readdirSync, readFileSync, statSync, existsSync } = require('node:fs') as typeof import('node:fs')
  const path = (require('node:path') as typeof import('node:path')).join(baseDir, 'skills')
  if (!existsSync(path)) return SkillsDefaults
  const stat = statSync(path)
  if (!stat.isDirectory()) return SkillsDefaults
  const names = readdirSync(path)
  const entries: { name: string; description: string }[] = []
  for (const name of names) {
    let description = ''
    const manifestPath = (require('node:path') as typeof import('node:path')).join(path, name, 'SKILL.md')
    if (existsSync(manifestPath)) {
      try {
        const buffer = readFileSync(manifestPath, 'utf8')
        description = extractFirstParagraph(buffer)
      } catch {
        description = ''
      }
    }
    entries.push({ name, description })
  }
  entries.sort((a, b) => a.name.localeCompare(b.name))
  return { entries, generatedAt: Date.now() }
}

/**
 * Pull the first paragraph of a markdown manifest. The walker stops at the
 * first blank line or heading so the description stays short even when the
 * manifest is long.
 */
function extractFirstParagraph(text: string): string {
  const lines = text.split(/\r?\n/)
  const collected: string[] = []
  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.length === 0) break
    if (trimmed.startsWith('#')) break
    collected.push(trimmed)
  }
  return collected.join(' ').slice(0, 240)
}

/** Register the top-level bilingual settings section through the host provider. */
export function apply(ctx: HostContext): () => void {
  // Subscribe to the settings service and register one namespace. The
  // provider's `register` returns an owner scope; we mirror that contract on
  // the typed adapter side and rely on the host to persist the section.
  const settings = ctx.get('settings') as
    | {
        register?<T>(ns: string, schema: unknown, options?: { base?: T }): {
          get(): T
          watch(cb: () => void): () => void
        }
      }
    | undefined

  if (settings?.register === undefined) {
    return () => {}
  }

  const scope = settings.register('ice-tools', Config, { base: defaults })
  // Touch the scope so the host knows the section is live, and reduce on each
  // commit to keep `settingsHub` non-toggleable.
  void scope.get()
  scope.watch(() => {
    const next = scope.get()
    void normalizeEnabled(next.enabled)
  })

  // Register the read-only skills mirror as a sibling namespace so the
  // client side can read it through its settings scope without touching
  // node:fs or relying on a session-scoped skills RPC.
  const homeDir = ctx.get('homeDir') as string | undefined
  const mirror = readSkillsMirror(homeDir)
  settings.register('ice-tools-skills', SkillsConfig, { base: mirror })

  return () => {}
}
