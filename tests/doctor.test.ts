import { describe, expect, it } from 'vitest'
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import { runDoctor, type CheckKey } from '../src/modules/doctor/client.ts'
import { en } from '../src/i18n/en.ts'
import { zh } from '../src/i18n/zh.ts'

function makeConnection(settingsResult: unknown): ClientContext {
  const ctx = {
    get: (name: string) => {
      if (name === 'connection') {
        return {
          api: {
            settings: {
              describe: async () => ({ result: { ok: true, value: settingsResult } }),
            },
          },
        }
      }
      return undefined
    },
    // The doctor also reads `ctx.locale` directly, so the mock carries it
    // as a property rather than going through `ctx.get`.
    locale: {
      getSnapshot: () => ({ active: 'zh', revision: 1 }),
    },
  }
  return ctx as unknown as ClientContext
}

function findResult(run: Awaited<ReturnType<typeof runDoctor>>, key: CheckKey) {
  const result = run.results.find((entry) => entry.key === key)
  if (result === undefined) throw new Error(`missing check: ${key}`)
  return result
}

const completeDescribe = {
  writable: true,
  namespaces: [
    {
      ns: 'ice-tools',
      schema: { type: 'object', props: {} },
      value: {
        enabled: {
          settingsHub: true,
          pluginManager: false,
          chatRecovery: false,
          desktopLauncher: false,
          doctor: true,
          sessionId: true,
          skillExplorer: false,
          gitGraph: false,
          taskBoard: false,
        },
      },
    },
  ],
}

describe('runDoctor (client-only checks)', () => {
  it('returns thirteen checks in order', async () => {
    const run = await runDoctor(makeConnection(completeDescribe))
    expect(run.results).toHaveLength(13)
  })

  it('passes the connection, settings, namespace, schema, writable, and locale checks on a healthy setup', async () => {
    const run = await runDoctor(makeConnection(completeDescribe))
    expect(findResult(run, 'connection').pass).toBe(true)
    expect(findResult(run, 'settingsDescribe').pass).toBe(true)
    expect(findResult(run, 'namespaceRegistered').pass).toBe(true)
    expect(findResult(run, 'schemaSerializable').pass).toBe(true)
    expect(findResult(run, 'providerWritable').pass).toBe(true)
    expect(findResult(run, 'localeActive').pass).toBe(true)
  })

  it('passes localeCoverage because zh and en carry the same module keys', async () => {
    const run = await runDoctor(makeConnection(completeDescribe))
    expect(findResult(run, 'localeCoverage').pass).toBe(true)
  })

  it('passes the platform API checks when the locals exist', async () => {
    const run = await runDoctor(makeConnection(completeDescribe))
    // fetch + AbortController are present in modern node, the clipboard
    // and localStorage APIs are browser-only and fall through as Fail
    // under the vitest default node environment.
    expect(findResult(run, 'clipboardApi').pass).toBe(false)
    expect(findResult(run, 'localStorageApi').pass).toBe(false)
    expect(findResult(run, 'fetchApi').pass).toBe(true)
  })

  it('records the run timestamp', async () => {
    const before = Date.now()
    const run = await runDoctor(makeConnection(completeDescribe))
    expect(run.ranAt).toBeGreaterThanOrEqual(before)
    expect(run.ranAt).toBeLessThanOrEqual(Date.now())
  })

  it('flags a missing connection service', async () => {
    const ctx = {
      get: () => undefined,
    } as unknown as ClientContext
    const run = await runDoctor(ctx)
    expect(findResult(run, 'connection').pass).toBe(false)
    expect(findResult(run, 'settingsDescribe').pass).toBe(false)
    expect(findResult(run, 'settingsDescribe').note).toMatch(/skipped|missing/)
  })

  it('flags a non-writable provider', async () => {
    const describe = { ...completeDescribe, writable: false }
    const run = await runDoctor(makeConnection(describe))
    expect(findResult(run, 'providerWritable').pass).toBe(false)
  })

  it('flags a missing ice-tools namespace', async () => {
    const describe = { ...completeDescribe, namespaces: [] }
    const run = await runDoctor(makeConnection(describe))
    expect(findResult(run, 'namespaceRegistered').pass).toBe(false)
    expect(findResult(run, 'enabledKeys').pass).toBe(false)
    expect(findResult(run, 'enabledKeys').note).toMatch(/skipped/)
  })

  it('flags an enabled map missing required keys', async () => {
    const describe = {
      ...completeDescribe,
      namespaces: [
        {
          ns: 'ice-tools',
          schema: { type: 'object', props: {} },
          value: { enabled: { settingsHub: true } },
        },
      ],
    }
    const run = await runDoctor(makeConnection(describe))
    expect(findResult(run, 'enabledKeys').pass).toBe(false)
    expect(findResult(run, 'enabledKeys').note).toMatch(/missing/)
  })

  it('accepts a custom check order', async () => {
    const run = await runDoctor(makeConnection(completeDescribe))
    const order: readonly CheckKey[] = run.results.map((entry) => entry.key)
    expect(order[0]).toBe('connection')
    expect(order[order.length - 1]).toBe('fetchApi')
  })
})

describe('locale dictionary parity', () => {
  it('en and zh expose the same set of module keys', () => {
    const enKeys = Object.keys(en.modules).sort()
    const zhKeys = Object.keys(zh.modules).sort()
    expect(enKeys).toEqual(zhKeys)
  })
})