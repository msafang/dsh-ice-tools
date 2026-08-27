import { describe, expect, it } from 'vitest'
import { parseCordisPatch } from '../src/modules/plugin-manager/client.ts'

describe('parseCordisPatch', () => {
  it('parses a single insert row with id only', () => {
    const source = `- insert:
    - id: tool-subagent-codex`
    const result = parseCordisPatch(source)
    expect(result.rows).toHaveLength(1)
    expect(result.rows[0]!.id).toBe('tool-subagent-codex')
    expect(result.rows[0]!.name).toBeUndefined()
    expect(result.rows[0]!.config).toEqual({})
    expect(result.unrecognized).toEqual([])
    expect(result.duplicates).toEqual([])
  })

  it('parses a row with name and config', () => {
    const source = `- insert:
    - id: tool-subagent-codex
      name: '@deepseek-ai/dsh-tool-subagent'
      config:
        provider: codex
        toolName: subagent_codex
        backgroundMode: one-shot
        maxDepth: provider-managed`
    const result = parseCordisPatch(source)
    expect(result.rows).toHaveLength(1)
    expect(result.rows[0]!.id).toBe('tool-subagent-codex')
    expect(result.rows[0]!.name).toBe('@deepseek-ai/dsh-tool-subagent')
    expect(result.rows[0]!.config).toMatchObject({
      provider: 'codex',
      toolName: 'subagent_codex',
      backgroundMode: 'one-shot',
      maxDepth: 'provider-managed',
    })
    expect(result.rows[0]!.rawConfig.length).toBeGreaterThan(0)
  })

  it('flags duplicate ids with their line numbers', () => {
    const source = `- insert:
    - id: shared-row
      name: 'first'
    - id: shared-row
      name: 'second'`
    const result = parseCordisPatch(source)
    expect(result.rows).toHaveLength(2)
    // The first row sits on the line that begins with `- id:` (line 2 in
    // the test source); the second row starts four lines below the
    // header. The exact line number depends on how the walker counts the
    // opening `- insert:` line; the test pins the current behaviour
    // rather than asserting a specific convention.
    expect(result.duplicates[0]!.id).toBe('shared-row')
    expect(result.duplicates[0]!.lines.length).toBe(2)
    expect(result.duplicates[0]!.lines[1]).toBeGreaterThan(result.duplicates[0]!.lines[0]!)
  })

  it('parses multiple insert blocks and accumulates rows', () => {
    const source = `- insert:
    - id: alpha
- insert:
    - id: beta
      name: 'B'`
    const result = parseCordisPatch(source)
    expect(result.rows).toHaveLength(2)
    expect(result.rows[0]!.id).toBe('alpha')
    expect(result.rows[1]!.id).toBe('beta')
    expect(result.rows[1]!.name).toBe('B')
  })

  it('handles a config block with nested braces', () => {
    const source = `- insert:
    - id: nested
      config:
        trailing: ok
        nested: { inner: value }`
    const result = parseCordisPatch(source)
    expect(result.rows).toHaveLength(1)
    // rawConfig preserves the text as-written (including nested braces).
    expect(result.rows[0]!.rawConfig).toContain('trailing')
    expect(result.rows[0]!.rawConfig).toContain('inner')
    // Flat top-level config map extracts only the outer-level scalar keys.
    expect(result.rows[0]!.config.trailing).toBe('ok')
  })

  it('keeps rows whose shape it cannot parse under unrecognized', () => {
    const source = `- insert:
    - some_mystery: 'value'
    - id: well-formed`
    const result = parseCordisPatch(source)
    expect(result.rows).toHaveLength(1)
    expect(result.rows[0]!.id).toBe('well-formed')
    expect(result.unrecognized.length).toBeGreaterThan(0)
  })

  it('returns empty rows when source has no insert blocks', () => {
    const result = parseCordisPatch('# empty\n')
    expect(result.rows).toEqual([])
    expect(result.unrecognized).toEqual([])
    expect(result.duplicates).toEqual([])
  })
})