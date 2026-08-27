import { describe, expect, it } from 'vitest'
import {
  DEFAULT_ENABLED,
  MODULE_NAMES,
  normalizeEnabled,
  type ModuleName,
} from '../src/core/dispatch/index.ts'

describe('dispatch module identity', () => {
  it('exposes nine module names', () => {
    expect(MODULE_NAMES).toHaveLength(9)
    expect(MODULE_NAMES).toContain('settingsHub')
    expect(MODULE_NAMES).toContain('doctor')
    expect(MODULE_NAMES).toContain('sessionId')
  })

  it('locks settingsHub on by default', () => {
    expect(DEFAULT_ENABLED.settingsHub).toBe(true)
  })

  it('keeps doctor and sessionId on by default', () => {
    expect(DEFAULT_ENABLED.doctor).toBe(true)
    expect(DEFAULT_ENABLED.sessionId).toBe(true)
  })

  it('leaves the other six modules off by default', () => {
    const off: ModuleName[] = [
      'pluginManager',
      'chatRecovery',
      'desktopLauncher',
      'skillExplorer',
      'gitGraph',
      'taskBoard',
    ]
    for (const name of off) {
      expect(DEFAULT_ENABLED[name]).toBe(false)
    }
  })
})

describe('normalizeEnabled', () => {
  it('returns an all-off section when input is undefined (settingsHub still on)', () => {
    const result = normalizeEnabled(undefined)
    expect(result).toEqual({
      settingsHub: true,
      pluginManager: false,
      chatRecovery: false,
      desktopLauncher: false,
      doctor: false,
      sessionId: false,
      skillExplorer: false,
      gitGraph: false,
      taskBoard: false,
    })
  })

  it('locks settingsHub to true even when input opts out', () => {
    const result = normalizeEnabled({ settingsHub: false } as Partial<Record<ModuleName, unknown>>)
    expect(result.settingsHub).toBe(true)
  })

  it('preserves boolean entries for known modules', () => {
    const result = normalizeEnabled({ sessionId: true, taskBoard: true } as Partial<Record<ModuleName, unknown>>)
    expect(result.sessionId).toBe(true)
    expect(result.taskBoard).toBe(true)
    // Unmentioned keys stay off; the caller decides what to enable.
    expect(result.doctor).toBe(false)
  })

  it('ignores non-boolean entries', () => {
    const result = normalizeEnabled({
      sessionId: 'yes',
      taskBoard: 1,
      pluginManager: null,
    } as unknown as Partial<Record<ModuleName, unknown>>)
    expect(result.sessionId).toBe(false)
    expect(result.taskBoard).toBe(false)
    expect(result.pluginManager).toBe(false)
  })

  it('ignores unknown module names without throwing', () => {
    const result = normalizeEnabled({
      notAModule: true,
      sessionId: true,
    } as unknown as Partial<Record<ModuleName, unknown>>)
    expect(result.sessionId).toBe(true)
  })
})