/**
 * gitGraph: client-only renderer for `git log --graph` output. The browser
 * cannot run a git subprocess, so the block accepts pasted log text and
 * renders it as a static SVG-free ascii grid. The user copies `git log
 * --graph --oneline` (or `git log --graph --oneline --all --decorate`) from
 * a terminal and pastes it into the textarea; the parser keeps each line
 * intact and highlights the path characters so the tree shape is easy to
 * scan.
 *
 * A future revision can wire this to a Host subprocess service once the
 * plugin owns one; the public surface here stays the same.
 */

export interface GitGraphLine {
  readonly kind: 'commit' | 'merge' | 'branch' | 'other'
  readonly text: string
  readonly depth: number
}

/**
 * Parse a single `git log --graph` output line. The classifier is
 * intentionally shallow: it does not try to walk the graph topology, only
 * to distinguish the lines that look like commits (one hash + message)
 * from the lines that carry graph markers. The `depth` field is the number
 * of leading graph characters, so the UI can indent continuation lines
 * under their parent commit.
 */
export function parseGitGraphLine(line: string): GitGraphLine {
  const trimmed = line.replace(/\s+$/, '')
  if (trimmed.length === 0) return { kind: 'other', text: '', depth: 0 }
  let depth = 0
  while (depth < trimmed.length) {
    const ch = trimmed[depth]
    if (ch === '*' || ch === '|' || ch === '+' || ch === 'x' || ch === '-' || ch === '_') depth += 1
    else break
  }
  const rest = trimmed.slice(depth).trim()
  if (rest.length === 0) return { kind: 'branch', text: '', depth }
  const hashMatch = rest.match(/^([0-9a-f]{7,})\s+(.+)$/)
  if (hashMatch !== null) {
    const kind = rest.includes('Merge:') || rest.startsWith('*') ? 'merge' : 'commit'
    return { kind, text: rest, depth }
  }
  return { kind: 'branch', text: rest, depth }
}

/** Split a paste blob into lines, dropping the trailing empty line. */
export function parseGitGraphOutput(source: string): readonly GitGraphLine[] {
  const lines = source.replace(/\r\n/g, '\n').split('\n')
  if (lines.length > 0 && lines[lines.length - 1]!.trim() === '') lines.pop()
  return lines.map((line) => parseGitGraphLine(line))
}

export interface GitGraphSummary {
  readonly totalLines: number
  readonly commitCount: number
  readonly mergeCount: number
  readonly branchCount: number
  readonly otherCount: number
}

export function summarizeGraph(lines: readonly GitGraphLine[]): GitGraphSummary {
  let commitCount = 0
  let mergeCount = 0
  let branchCount = 0
  let otherCount = 0
  for (const line of lines) {
    if (line.kind === 'commit') commitCount += 1
    else if (line.kind === 'merge') mergeCount += 1
    else if (line.kind === 'branch') branchCount += 1
    else otherCount += 1
  }
  return {
    totalLines: lines.length,
    commitCount,
    mergeCount,
    branchCount,
    otherCount,
  }
}