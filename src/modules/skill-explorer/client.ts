/**
 * skillExplorer: the host side registers a read-only `ice-tools-skills`
 * namespace under the settings provider at apply time. The namespace mirrors
 * one level of the `~/.dsh/skills/` directory: every subdirectory shows up
 * as an `entry` with its `SKILL.md` first paragraph as the description.
 *
 * The client side reads the mirror through the same settings scope that
 * drives the toggle UI, so the block always reflects whatever the host last
 * observed. The browser never reads the filesystem directly: the host's
 * apply step does the walk, the settings transport carries the result, and
 * the client renders.
 *
 * A future revision can keep the catalogue in sync from session-scoped
 * skill RPCs by writing to the namespace through `settings.replace`.
 */

export interface SkillEntry {
  readonly name: string
  readonly description: string
  readonly location: string
}

export interface SkillsMirror {
  readonly entries: readonly { readonly name: string; readonly description: string }[]
  readonly generatedAt: number
}

/** Fallback catalogue used when the host mirror is unavailable. */
export const KNOWN_SKILLS: readonly SkillEntry[] = [
  {
    name: 'agently-mail',
    description: 'Email operations through the agently-cli skill set.',
    location: '~/.dsh/skills/agently-mail',
  },
  {
    name: 'manage-taskboard',
    description: 'Read and write the Codex / e-taskboard task ledger.',
    location: '~/.dsh/skills/manage-taskboard',
  },
  {
    name: 'qiaomu-design',
    description: 'Opinionated design review and rebuild advisory skill.',
    location: '~/.dsh/skills/qiaomu-design',
  },
]

/**
 * Map a mirror entry to the shape the UI expects. The host supplies `name`
 * and `description`; the location is a fixed convention the host follows
 * when it populates the mirror.
 */
export function mirrorToEntries(mirror: SkillsMirror, homeDir: string = '~/.dsh'): readonly SkillEntry[] {
  return mirror.entries.map((entry) => ({
    name: entry.name,
    description: entry.description,
    location: `${homeDir}/skills/${entry.name}`,
  }))
}

export const MIRROR_NAMESPACE = 'ice-tools-skills'

interface SettingsScopeLikeMirror {
  getSnapshot(): { readonly value: SkillsMirror | undefined }
  subscribe(listener: () => void): () => void
}

/**
 * Read the skills mirror from a bound settings scope. The shape is loose
 * because the namespace may not be registered when the host is older than
 * the client, or when the runtime mounts without a settings provider.
 */
export function readSkillsMirror(scope: SettingsScopeLikeMirror): SkillsMirror | undefined {
  return scope.getSnapshot().value
}