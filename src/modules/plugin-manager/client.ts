/**
 * pluginManager: surfaces the Cordis loader rows the local profile's
 * `cordis.patch.yml` adds on top of the base bundles. The browser cannot
 * enumerate live cordis fibers without a host RPC, so the manager falls
 * back to a static read of the profile's `cordis.patch.yml` (an existing,
 * version-tracked file the loader already reads). Rows are parsed with a
 * narrow YAML walker that tolerates the loader's `insert:` / `- id:`
 * shape; rows with an unrecognized shape are kept as raw strings so the
 * UI surfaces them instead of silently dropping them.
 *
 * The intent is a discovery surface: a user opening Settings -> ICE Tools
 * -> Plugin Manager can see which extra rows this profile installs and
 * their order, without needing host introspection.
 */

export interface PluginRow {
  readonly id: string
  readonly name?: string
  readonly kind: string
}

export interface ParsedPatch {
  readonly rows: readonly PluginRow[]
  readonly unrecognized: readonly string[]
}

const INSERT_HEAD = /^[\s\S]*?-?\s*insert:\s*([\s\S]*)$/m

/**
 * Light YAML extractor for the cordis patch format the DSH loader emits.
 * We do not depend on a YAML parser (the plugin stays runtime-dep-free);
 * this walker handles the subset we care about: top-level `insert:`
 * lists of `- id: ... -- optional name: ...` mappings.
 */
export function parseCordisPatch(source: string): ParsedPatch {
  const rows: PluginRow[] = []
  const unrecognized: string[] = []
  // Find every `insert:` block, then walk its lines.
  const insertBlocks = source.split(/\n-?\s*insert:\s*/).slice(1)
  for (const block of insertBlocks) {
    const segment = block.split(/\n-?\s*(?:-?\s*insert:|[a-z]+:)/)[0] ?? block
    const idMatch = segment.match(/^\s*-\s*id:\s*([^\s#]+)/)
    if (idMatch === null) {
      const firstLine = segment.split('\n')[0]?.trim() ?? ''
      if (firstLine.length > 0) unrecognized.push(firstLine)
      continue
    }
    const row: PluginRow = { id: idMatch[1], kind: 'insert' }
    const nameMatch = segment.match(/\n\s*name:\s*([^\n#]+)/)
    if (nameMatch !== null) (row as { name?: string }).name = nameMatch[1].trim()
    rows.push(row)
  }
  return { rows, unrecognized }
}