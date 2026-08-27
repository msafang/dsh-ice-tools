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
  const recordIndex: Map<string, number> = new Map()

  // Find every `insert:` keyword, in order. Each one starts a new block; the
  // segment between two keywords (or the head / tail) is the body of one
  // insert list. Track the absolute offset of every keyword so we can
  // report each row's source line.
  const keywordOffsets: number[] = []
  const keywordPattern = /\n?\s*-?\s*insert:\s*/g
  let match: RegExpExecArray | null
  while ((match = keywordPattern.exec(source)) !== null) {
    keywordOffsets.push(match.index)
  }

  for (let i = 0; i < keywordOffsets.length; i += 1) {
    const keywordOffset = keywordOffsets[i]!
    // Find the end of the `insert:` keyword itself so the row bodies start
    // on the next non-whitespace character.
    const headerMatch = source.slice(keywordOffset).match(/^[\s\S]*?-?\s*insert:\s*/)
    const blockStartOffset = keywordOffset + (headerMatch?.[0].length ?? 0)
    const endOffset = i + 1 < keywordOffsets.length ? keywordOffsets[i + 1]! : source.length
    const block = source.slice(blockStartOffset, endOffset)
    // Each insert list contains one or more rows that start with `- id:`. The
    // first row's body is everything from the id line up to the next
    // `- id:` line; subsequent rows repeat the same pattern.
    const rowSegments = splitRows(block)
    let rowCursorOffset = blockStartOffset
    for (const segment of rowSegments) {
      const idMatch = segment.match(/\n?\s*-\s*id:\s*([^\s#]+)/)
      if (idMatch === null) {
        const firstLine = segment.split('\n')[0]?.trim() ?? ''
        if (firstLine.length > 0) unrecognized.push(firstLine)
        continue
      }
      const id = idMatch[1]!
      const startLine = computeLineOf(source, rowCursorOffset)
      const nameMatch = segment.match(/\n\s*name:\s*['"]?([^'"\n#]+)['"]?/)
      const configText = extractConfig(segment)
      const configMap = parseConfigMap(configText)
      const rawConfig = configText.trim()
      const row: PluginRow = {
        id,
        ...(nameMatch === null ? {} : { name: nameMatch[1]!.trim() }),
        kind: 'insert',
        config: configMap,
        rawConfig,
        line: startLine,
      }
      rows.push(row)
      recordIndex.set(id, (recordIndex.get(id) ?? 0) + 1)
      rowCursorOffset += segment.length
    }
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

function computeLineOf(source: string, offset: number): number {
  let line = 1
  for (let i = 0; i < offset && i < source.length; i += 1) {
    if (source.charCodeAt(i) === 10) line += 1
  }
  return line
}

/**
 * Split one insert block on every `- id:` boundary so each returned
 * segment is one row. The walker counts braces while looking for the
 * boundary, so a config block with nested `{`/`}` does not produce a
 * spurious split.
 */
function splitRows(block: string): string[] {
  const segments: string[] = []
  let depth = 0
  let start = 0
  for (let i = 0; i < block.length; i += 1) {
    const ch = block.charAt(i)
    if (ch === '{') depth += 1
    else if (ch === '}') depth = Math.max(0, depth - 1)
    else if (depth === 0 && block.startsWith('- id:', i)) {
      if (i > start) segments.push(block.slice(start, i))
      start = i
    }
  }
  if (start < block.length) segments.push(block.slice(start))
  return segments
}

/**
 * Pull the `config:` block out of one insert segment. The walker matches
 * the loader's `config:` keyword, finds the matching `{`, and reads until
 * the matching `}` (counting braces so nested values survive).
 */
/**
 * Pull the `config:` block out of one insert segment. Two layouts ship in
 * the wild: a flat `{ ... }` JSON-ish form and a flat-key form written
 * under the `config:` keyword. The walker accepts both: brace-balanced
 * blocks return the inner text; flat-key blocks return the lines that
 * follow `config:` until the next sibling key (or the next `- id:`
 * boundary detected by the caller) takes over.
 */
function extractConfig(segment: string): string {
  const match = segment.match(/\n\s*config:\s*([\s\S]*)/)
  if (match === null) return ''
  const body = match[1] ?? ''
  if (!body.includes('{')) return body
  let depth = 0
  let end = 0
  let started = false
  for (let i = 0; i < body.length; i += 1) {
    const ch = body.charAt(i)
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
  return body.slice(0, end)
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