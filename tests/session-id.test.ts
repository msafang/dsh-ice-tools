import { describe, expect, it } from 'vitest'
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import {
  filterSessions,
  joinSessionIds,
  type SessionSummary,
} from '../src/modules/session-id/client.ts'

const noopContext = { get: () => undefined } as unknown as ClientContext

function makeConnection(overrides: {
  list?: unknown
  create?: unknown
  rename?: unknown
  cancel?: unknown
} = {}): ClientContext {
  const list = overrides.list ?? { items: [] }
  const create = overrides.create ?? { sessionId: 's-new' }
  const rename = overrides.rename ?? {}
  const cancel = overrides.cancel ?? {}
  const ctx = {
    get: (name: string) => name === 'connection'
      ? {
          api: {
            sessions: {
              list: async () => ({ result: { ok: true, value: list } }),
              create: async () => ({ result: { ok: true, value: create } }),
              rename: async () => ({ result: { ok: true, value: rename } }),
              cancel: async () => ({ result: { ok: true, value: cancel } }),
            },
          },
        }
      : undefined,
  }
  return ctx as unknown as ClientContext
}

function errorConnection(message: string): ClientContext {
  const ctx = {
    get: (name: string) => name === 'connection'
      ? {
          api: {
            sessions: {
              list: async () => ({ result: { ok: false, error: { message } } }),
              create: async () => ({ result: { ok: false, error: { message } } }),
              rename: async () => ({ result: { ok: false, error: { message } } }),
              cancel: async () => ({ result: { ok: false, error: { message } } }),
            },
          },
        }
      : undefined,
  }
  return ctx as unknown as ClientContext
}

const sessions: readonly SessionSummary[] = [
  { sessionId: 's1', title: 'one', running: true, cwd: '/a' },
  { sessionId: 's2', title: 'two', running: false },
  { sessionId: 's3', title: 'three', running: true },
  { sessionId: 's4', running: false },
]

describe('filterSessions', () => {
  it('"all" returns the input unchanged', () => {
    expect(filterSessions(sessions, 'all')).toBe(sessions)
  })

  it('"running" keeps only running sessions', () => {
    expect(filterSessions(sessions, 'running').map((s) => s.sessionId)).toEqual(['s1', 's3'])
  })

  it('"idle" keeps only non-running sessions', () => {
    expect(filterSessions(sessions, 'idle').map((s) => s.sessionId)).toEqual(['s2', 's4'])
  })
})

describe('joinSessionIds', () => {
  it('joins session ids with a newline', () => {
    expect(joinSessionIds(sessions)).toBe('s1\ns2\ns3\ns4')
  })

  it('returns an empty string for an empty list', () => {
    expect(joinSessionIds([])).toBe('')
  })
})

describe('sessionId RPC wrappers via the mock connection', () => {
  it('listSessions returns the parsed items on a healthy connection', async () => {
    const ctx = makeConnection({ list: { items: [
      { sessionId: 's1', title: 'one', running: true, cwd: '/a' },
      { sessionId: 's2', title: 'two' },
      'string entry', // dropped
      { id: 'no-id' }, // dropped
    ] } })
    const { listSessions } = await import('../src/modules/session-id/client.ts')
    const result = await listSessions(ctx)
    expect(result.error).toBeUndefined()
    expect(result.sessions.map((s) => s.sessionId)).toEqual(['s1', 's2'])
  })

  it('listSessions surfaces an error when the connection is missing', async () => {
    const { listSessions } = await import('../src/modules/session-id/client.ts')
    const result = await listSessions(noopContext)
    expect(result.error).toBe('connection service missing')
    expect(result.sessions).toEqual([])
  })

  it('listSessions surfaces the server error message', async () => {
    const { listSessions } = await import('../src/modules/session-id/client.ts')
    const result = await listSessions(errorConnection('boom'))
    expect(result.error).toBe('boom')
    expect(result.sessions).toEqual([])
  })

  it('createSession returns ok on a healthy connection', async () => {
    const { createSession } = await import('../src/modules/session-id/client.ts')
    const result = await createSession(makeConnection(), '/tmp/proj')
    expect(result.ok).toBe(true)
    expect(result.message).toBe('session created')
  })

  it('createSession forwards the server error on failure', async () => {
    const { createSession } = await import('../src/modules/session-id/client.ts')
    const result = await createSession(errorConnection('nope'), '/tmp')
    expect(result.ok).toBe(false)
    expect(result.message).toBe('nope')
  })

  it('renameSession rejects empty titles client-side', async () => {
    const { renameSession } = await import('../src/modules/session-id/client.ts')
    const result = await renameSession(makeConnection(), 's1', '   ')
    expect(result.ok).toBe(false)
    expect(result.message).toBe('title cannot be empty')
  })

  it('renameSession returns ok when the server accepts', async () => {
    const { renameSession } = await import('../src/modules/session-id/client.ts')
    const result = await renameSession(makeConnection(), 's1', 'fresh title')
    expect(result.ok).toBe(true)
    expect(result.message).toBe('renamed')
  })

  it('cancelSession returns ok on a healthy connection', async () => {
    const { cancelSession } = await import('../src/modules/session-id/client.ts')
    const result = await cancelSession(makeConnection(), 's1')
    expect(result.ok).toBe(true)
    expect(result.message).toBe('cancel sent')
  })
})