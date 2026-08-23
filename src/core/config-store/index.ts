import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'
import {
  DEFAULT_ENABLED,
  MODULE_NAMES,
  normalizeEnabled,
  type ConfigSource,
  type EnabledModules,
  type IceConfig,
  type ModuleName,
} from '../dispatch/index.ts'

export const CONFIG_FILE_NAME = 'dsh-ice-tools.json'

export function resolveConfigPath(homeDir?: string): string {
  const dshHome = homeDir ?? process.env.DSH_HOME ?? join(homedir(), '.dsh')
  return join(dshHome, CONFIG_FILE_NAME)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function parseConfig(value: unknown): IceConfig {
  if (!isRecord(value) || !isRecord(value.enabled)) {
    return { enabled: { ...DEFAULT_ENABLED } }
  }
  return { enabled: normalizeEnabled(value.enabled as Partial<Record<ModuleName, unknown>>) }
}

export class ConfigStore implements ConfigSource {
  readonly filePath: string

  constructor(filePath = resolveConfigPath()) {
    this.filePath = filePath
  }

  read(): IceConfig {
    if (!existsSync(this.filePath)) return { enabled: { ...DEFAULT_ENABLED } }
    try {
      return parseConfig(JSON.parse(readFileSync(this.filePath, 'utf8')))
    } catch {
      return { enabled: { ...DEFAULT_ENABLED } }
    }
  }

  write(config: IceConfig): IceConfig {
    const normalized: IceConfig = { enabled: normalizeEnabled(config.enabled) }
    const parent = dirname(this.filePath)
    mkdirSync(parent, { recursive: true })
    const tempPath = `${this.filePath}.${process.pid}.tmp`
    writeFileSync(tempPath, `${JSON.stringify(normalized, null, 2)}\n`, 'utf8')
    renameSync(tempPath, this.filePath)
    return normalized
  }

  setEnabled(name: ModuleName, enabled: boolean): IceConfig {
    const current = this.read()
    const next: EnabledModules = { ...current.enabled, [name]: enabled }
    next.settingsHub = true
    return this.write({ enabled: next })
  }

  reset(): IceConfig {
    return this.write({ enabled: { ...DEFAULT_ENABLED } })
  }
}

export function isValidConfig(value: unknown): value is IceConfig {
  if (!isRecord(value) || !isRecord(value.enabled)) return false
  const enabled = value.enabled
  return MODULE_NAMES.every((name) => typeof enabled[name] === 'boolean')
}
