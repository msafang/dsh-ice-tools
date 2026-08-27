import { describe, expect, it } from 'vitest'
import type { HostContext } from '../src/core/dsh-adapter/index.ts'
import { MODULE_NAMES } from '../src/core/dispatch/index.ts'
import { en } from '../src/i18n/en.ts'
import { zh } from '../src/i18n/zh.ts'
import { apply as applySettingsHub } from '../src/modules/settings-hub/index.ts'
import { enableSettingsCard, renderSettingsCard } from '../src/modules/settings-hub/client.ts'

describe('dsh-ice-tools smoke contracts', () => {
  it('settingsHub registers one section and exposes nine bilingual toggles', () => {
    const registered: Array<{ ns: string; schema: (value: unknown) => unknown; defaults: unknown }> = []
    const ctx = {
      get: (name: string) => name === 'settings'
        ? {
            register: (
              ns: string,
              schema: (value: unknown) => unknown,
              options: { base?: unknown },
            ) => {
              registered.push({ ns, schema, defaults: options.base })
              return {
                get: () => schema(undefined),
                watch: () => () => {},
              }
            },
          }
        : undefined,
    } as unknown as HostContext

    applySettingsHub(ctx)
    // The host registers two namespaces: the toggle surface itself plus the
    // read-only skills mirror that the Skill Explorer block reads.
    expect(registered).toHaveLength(2)
    expect(registered[0].ns).toBe('ice-tools')
    expect(registered[1].ns).toBe('ice-tools-skills')
    // The schema must be callable (the provider resolves by invoking it) and
    // normalize the enabled map.
    expect(registered[0].schema).toBeTypeOf('function')
    expect(registered[0].schema({ enabled: { sessionId: true } })).toMatchObject({ enabled: { sessionId: true } })
    expect(registered[0].defaults).toMatchObject({ enabled: { settingsHub: true } })

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
