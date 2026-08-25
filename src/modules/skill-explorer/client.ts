/**
 * skillExplorer: ship a tiny local catalogue of known skills so the ICE
 * Tools settings page can render them without taking a dependency on the
 * Host's skills registry RPC. The registry is session-scoped at the Host
 * level, which makes it awkward to call from the settings UI; the local
 * catalogue is enough for a discovery surface that lists what skills the
 * plugin knows about and where they live on disk.
 *
 * A future revision can extend this to also call the connection API when
 * the Host registers a session-less catalog route.
 */

export interface SkillEntry {
  readonly name: string
  readonly description: string
  readonly location: string
}

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