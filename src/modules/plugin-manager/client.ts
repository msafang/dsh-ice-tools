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
 * -> Plugin Manager can see which extra rows this profile installs, what
 * `config:` they carry, and which `id` values collide within the file. The
 * manager does not write back to the file: cordis.patch.yml stays an
 * upstream configuration that the user edits in their editor.
 */

export interface PluginRow {
  readonly id: string
  readonly name?: string
  readonly kind: string
  readonly config: Record<string, string>
  readonly rawConfig: string
  readonly line: number
}

export interface DuplicateRow {
  readonly id: string
  readonly lines: readonly number[]
}

export interface ParsedPatch {
  readonly rows: readonly PluginRow[]
  readonly unrecognized: readonly string[]
  readonly duplicates: readonly DuplicateRow[]
}

/**
 * Light YAML extractor for the cordis patch format the DSH loader emits.
 * We do not depend on a YAML parser (the plugin stays runtime-dep-free);
 * this walker handles the subset we care about: top-level `insert:`
 * lists of `- id: ... -- optional name: ... -- optional config: { ... }`
 * mappings.
 */
export function parseCordisPatch(source: string): ParsedPatch {
  const rows: PluginRow[] = []
  const unrecognized: string[] = []
  // Track the first occurrence line for the new-line index the UI shows.
  const lineStarts = computeLineStarts(source)
  const recordIndex: Map<string, number> = new Map()

  const insertBlocks = source.split(/\n-?\s*insert:\s*/).slice(1)
  for (const block of insertBlocks) {
    const segment = block.split(/\n-?\s*(?:-?\s*insert:|[a-z]+:)/)[0] ?? block
    const idMatch = segment.match(/^\s*-\s*id:\s*([^\s#]+)/)
    if (idMatch === null) {
      const firstLine = segment.split('\n')[0]?.trim() ?? ''
      if (firstLine.length > 0) unrecognized.push(firstLine)
      continue
    }
    const id = idMatch[1]
    const startLine = lineStarts.length === 0
      ? 0
      : lineStarts.findIndex((offset) => offset > (source.length - block.length)) + 1
    const nameMatch = segment.match(/\n\s*name:\s*([^\n#]+)/)
    const configText = extractConfig(segment)
    const configMap = parseConfigMap(configText)
    const rawConfig = configText.trim()
    const row: PluginRow = {
      id,
      ...(nameMatch === null ? {} : { name: nameMatch[1].trim() }),
      kind: 'insert',
      config: configMap,
      rawConfig,
      line: Math.max(1, startLine),
    }
    rows.push(row)
    recordIndex.set(id, (recordIndex.get(id) ?? 0) + 1)
  }

  const duplicates: DuplicateRow[] = []
  const lineById: Map<string, number[]> = new Map()
  for (let idx = 0; idx < rows.length; idx += 1) {
    const row = rows[idx]!
    const list = lineById.get(row.id) ?? []
    list.push(row.line)
    lineById.set(row.id, list)
  }
  for (const [id, lines] of lineById.entries()) {
    if (lines.length > 1) duplicates.push({ id, lines })
  }

  return { rows, unrecognized, duplicates }
}

function computeLineStarts(source: string): number[] {
  const starts: number[] = [0]
  for (let i = 0; i < source.length; i += 1) {
    if (source.charCodeAt(i) === 10) starts.push(i + 1)
  }
  return starts
}

/**
 * Pull the `config:` block out of one insert segment. The walker matches
 * the loader's `config:` keyword, finds the matching `{`, and reads until
 * the matching `}` (counting braces so nested values survive).
 */
function extractConfig(segment: string): string {
  const match = segment.match(/\n\s*config:\s*([\s\S]*)$/)
  if (match === null) return ''
  let depth = 0
  let end = 0
  let started = false
  for (let i = 0; i < match[1]!.length; i += 1) {
    const ch = match[1]!.charAt(i)
    if (ch === '{') {
      depth += 1
      started = true
    } else if (ch === '}') {
      depth -= 1
      if (started && depth === 0) {
        end = i + 1
        break
      }
    }
  }
  if (!started) return ''
  return match[1]!.slice(0, end)
}

/**
 * Parse the inner config block into a flat string map. The walker is
 * intentionally shallow: nested objects stay a stringified copy in
 * `rawConfig` so the UI can show the original text, while scalars and
 * top-level keys land in `config` so toggles and indicators have data
 * to act on.
 */
function parseConfigMap(raw: string): Record<string, string> {
  const trimmed = raw.trim()
  const inner = trimmed.startsWith('{') ? trimmed.slice(1, trimmed.lastIndexOf('}')) : trimmed
  const map: Record<string, string> = {}
  for (const line of inner.split('\n')) {
    const match = line.match(/^\s*([A-Za-z_][\w-]*)\s*:\s*(.+?)\s*$/)
    if (match === null) continue
    map[match[1]!] = match[2]!
  }
  return map
}