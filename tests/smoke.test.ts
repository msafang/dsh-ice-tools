import { describe, expect, it } from 'vitest'
import type { IceContext, SettingsSectionOptions } from '../src/core/dsh-adapter/index.ts'
import { MODULE_NAMES, OPTIONAL_MODULE_NAMES, mount, type ModuleAppliers } from '../src/core/dispatch/index.ts'
import { en } from '../src/i18n/en.ts'
import { zh } from '../src/i18n/zh.ts'
import { apply as applySettingsHub } from '../src/modules/settings-hub/index.ts'
import { enableSettingsCard, renderSettingsCard } from '../src/modules/settings-hub/client.ts'

describe('dsh-ice-tools smoke contracts', () => {
  it('dispatch mounts only enabled optional modules', () => {
    const calls: string[] = []
    const appliers = Object.fromEntries(
      OPTIONAL_MODULE_NAMES.map((name) => [name, () => calls.push(name)]),
    ) as unknown as ModuleAppliers
    const result = mount({} as IceContext, { settingsHub: true, sessionId: true }, appliers)

    expect(result).toEqual({
      pluginManager: 'skipped',
      chatRecovery: 'skipped',
      desktopLauncher: 'skipped',
      doctor: 'skipped',
      sessionId: 'apply',
      skillExplorer: 'skipped',
      gitGraph: 'skipped',
      taskBoard: 'skipped',
    })
    expect(calls).toEqual(['sessionId'])
  })

  it('settingsHub registers one section and exposes nine bilingual toggles', () => {
    const registered: SettingsSectionOptions[] = []
    const ctx: IceContext = {
      services: {
        settings: {
          installSettingsSection: (options) => {
            registered.push(options)
          },
        },
      },
    }

    applySettingsHub(ctx)
    expect(registered).toHaveLength(1)
    expect(registered[0]).toMatchObject({ id: 'ice-tools', order: 50, label: { zh: 'ICE 工具', en: 'ICE Tools' } })

    const toggles = enableSettingsCard({ enabled: { sessionId: true } })
    expect(toggles).toHaveLength(9)
    expect(toggles.map((toggle) => toggle.id)).toEqual([...MODULE_NAMES])
    expect(toggles.every((toggle) => toggle.label.zh.length > 0 && toggle.label.en.length > 0)).toBe(true)
    expect(toggles.find((toggle) => toggle.id === 'settingsHub')).toMatchObject({ enabled: true, disabled: true })

    const card = renderSettingsCard({ enabled: { sessionId: true } })
    expect(card).toMatchObject({
      type: 'ice-tools-settings-card',
      props: { 'data-dsh-plugin': 'ice-tools', 'data-dsh-part': 'settings-card' },
    })
  })

  it('the English dictionary covers every Chinese module entry', () => {
    for (const name of MODULE_NAMES) {
      expect(zh.modules[name].label).not.toBe('')
      expect(en.modules[name].label).not.toBe('')
      expect(en.modules[name].description).not.toBe('')
    }
    expect(Object.keys(zh.modules)).toEqual([...MODULE_NAMES])
  })
})
