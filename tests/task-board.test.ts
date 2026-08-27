import { describe, expect, it } from 'vitest'
import {
  addTask,
  exportJson,
  exportMarkdown,
  filterTasks,
  isBlocked,
  isOverdue,
  isoOffsetDays,
  loadTasks,
  moveTask,
  setDueDate,
  setPriority,
  sortTasks,
  todayIso,
  type Task,
} from '../src/modules/task-board/client.ts'

/**
 * Tasks persisted under the storage key are JSON. The module's loader
 * uses `localStorage` when available, falls back to an empty list in
 * non-browser test contexts, and never throws on malformed input. We
 * drive the loader through `globalThis.localStorage` shims.
 */
function withLocalStorage(initial: string | null, fn: () => void): void {
  const store = new Map<string, string>()
  if (initial !== null) store.set('dsh-ice-tools.tasks.v1', initial)
  const ls = {
    getItem: (key: string): string | null => store.get(key) ?? null,
    setItem: (key: string, value: string): void => { store.set(key, value) },
    removeItem: (key: string): void => { store.delete(key) },
    clear: (): void => { store.clear() },
    key: (index: number): string | null => Array.from(store.keys())[index] ?? null,
    get length(): number { return store.size },
  }
  Object.defineProperty(globalThis, 'localStorage', { value: ls, configurable: true })
  try { fn() } finally { delete (globalThis as Record<string, unknown>).localStorage }
}

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 't1',
    title: 'demo',
    done: false,
    createdAt: 0,
    priority: 'medium',
    order: 0,
    ...overrides,
  }
}

describe('isOverdue', () => {
  it('returns false for done tasks', () => {
    expect(isOverdue({ done: true, dueDate: '2000-01-01' }, '2099-01-01')).toBe(false)
  })

  it('returns false when no due date', () => {
    expect(isOverdue({ done: false }, '2099-01-01')).toBe(false)
  })

  it('returns true when due date is strictly before today', () => {
    expect(isOverdue({ done: false, dueDate: '2020-01-01' }, '2024-06-01')).toBe(true)
  })

  it('returns false when due date equals today', () => {
    expect(isOverdue({ done: false, dueDate: '2024-06-01' }, '2024-06-01')).toBe(false)
  })

  it('returns false when due date is in the future', () => {
    expect(isOverdue({ done: false, dueDate: '2099-01-01' }, '2024-06-01')).toBe(false)
  })
})

describe('isBlocked', () => {
  const blockers: readonly Task[] = [
    makeTask({ id: 'a', done: true }),
    makeTask({ id: 'b', done: false }),
  ]

  it('returns false when blockedBy is missing', () => {
    expect(isBlocked({}, blockers)).toBe(false)
  })

  it('returns false when blockers all done', () => {
    expect(isBlocked({ blockedBy: ['a'] }, blockers)).toBe(false)
  })

  it('returns true when at least one blocker is open', () => {
    expect(isBlocked({ blockedBy: ['a', 'b'] }, blockers)).toBe(true)
  })

  it('returns false when blocker id is unknown (treated as not-open)', () => {
    expect(isBlocked({ blockedBy: ['ghost'] }, blockers)).toBe(false)
  })
})

describe('filterTasks', () => {
  const tasks: readonly Task[] = [
    makeTask({ id: 'open', done: false, dueDate: '2020-01-01' }),
    makeTask({ id: 'done', done: true, priority: 'low' }),
    makeTask({ id: 'fresh', done: false, title: 'fresh idea' }),
  ]

  it('"all" returns every task', () => {
    expect(filterTasks(tasks, 'all', '')).toEqual(tasks)
  })

  it('"open" filters out done tasks', () => {
    expect(filterTasks(tasks, 'open', '')).toEqual([tasks[0]!, tasks[2]!])
  })

  it('"done" filters out open tasks', () => {
    expect(filterTasks(tasks, 'done', '')).toEqual([tasks[1]!])
  })

  it('"overdue" keeps only open, past-due tasks', () => {
    expect(filterTasks(tasks, 'overdue', '', '2024-01-01')).toEqual([tasks[0]!])
  })

  it('search matches title case-insensitively', () => {
    expect(filterTasks(tasks, 'all', 'FRESH')).toEqual([tasks[2]!])
  })
})

describe('sortTasks', () => {
  it('places open before done', () => {
    const sorted = sortTasks([
      makeTask({ id: 'a', done: true }),
      makeTask({ id: 'b', done: false }),
    ])
    expect(sorted.map((t) => t.id)).toEqual(['b', 'a'])
  })

  it('orders by priority within the open set', () => {
    const sorted = sortTasks([
      makeTask({ id: 'low', priority: 'low' }),
      makeTask({ id: 'high', priority: 'high' }),
      makeTask({ id: 'med', priority: 'medium' }),
    ])
    expect(sorted.map((t) => t.id)).toEqual(['high', 'med', 'low'])
  })

  it('falls back to order field as tie-breaker', () => {
    const sorted = sortTasks([
      makeTask({ id: 'a', order: 5 }),
      makeTask({ id: 'b', order: 2 }),
    ])
    expect(sorted.map((t) => t.id)).toEqual(['b', 'a'])
  })
})

describe('priority + due date + move + add + remove', () => {
  it('setPriority updates a single row', () => {
    const tasks: readonly Task[] = [
      makeTask({ id: 'a', priority: 'low' }),
      makeTask({ id: 'b', priority: 'low' }),
    ]
    const next = setPriority(tasks, 'b', 'high')
    expect(next[0]!.priority).toBe('low')
    expect(next[1]!.priority).toBe('high')
  })

  it('setDueDate stores an ISO date', () => {
    const next = setDueDate([makeTask()], 't1', '2026-12-01')
    expect(next[0]!.dueDate).toBe('2026-12-01')
  })

  it('setDueDate clears the date when given an empty string', () => {
    const withDate = setDueDate([makeTask({ dueDate: '2026-12-01' })], 't1', '')
    expect(withDate[0]!.dueDate).toBeUndefined()
  })

  it('moveTask(-1) swaps with the previous row', () => {
    const tasks: readonly Task[] = [
      makeTask({ id: 'a', order: 0 }),
      makeTask({ id: 'b', order: 1 }),
      makeTask({ id: 'c', order: 2 }),
    ]
    const next = moveTask(tasks, 'b', -1)
    expect(next.map((t) => t.id)).toEqual(['b', 'a', 'c'])
  })

  it('moveTask(+1) swaps with the next row', () => {
    const tasks: readonly Task[] = [
      makeTask({ id: 'a', order: 0 }),
      makeTask({ id: 'b', order: 1 }),
    ]
    const next = moveTask(tasks, 'a', 1)
    expect(next.map((t) => t.id)).toEqual(['b', 'a'])
  })

  it('moveTask returns the same list at the boundary', () => {
    const tasks: readonly Task[] = [makeTask({ id: 'only', order: 0 })]
    expect(moveTask(tasks, 'only', -1)).toBe(tasks)
    expect(moveTask(tasks, 'only', 1)).toBe(tasks)
  })

  it('addTask rejects whitespace-only titles', () => {
    expect(addTask([], '   ')).toEqual([])
  })

  it('addTask prepends the new task and persists it', () => {
    withLocalStorage(null, () => {
      const tasks = addTask([], 'first', { priority: 'high' })
      expect(tasks).toHaveLength(1)
      expect(tasks[0]!.title).toBe('first')
      expect(tasks[0]!.priority).toBe('high')
      // The new task shows up in a fresh load.
      expect(loadTasks()[0]!.id).toBe(tasks[0]!.id)
    })
  })
})

describe('isoOffsetDays + todayIso', () => {
  it('todayIso returns yyyy-mm-dd format', () => {
    expect(todayIso()).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('isoOffsetDays(0) equals todayIso', () => {
    expect(isoOffsetDays(0)).toBe(todayIso())
  })

  it('isoOffsetDays returns a date that is N days after today', () => {
    const today = new Date(todayIso() + 'T00:00:00Z').getTime()
    const next = new Date(isoOffsetDays(7) + 'T00:00:00Z').getTime()
    const diffDays = Math.round((next - today) / (1000 * 60 * 60 * 24))
    expect(diffDays).toBe(7)
  })
})

describe('loadTasks', () => {
  it('returns an empty list when storage is empty or absent', () => {
    withLocalStorage(null, () => {
      expect(loadTasks()).toEqual([])
    })
  })

  it('skips malformed entries rather than throwing', () => {
    const malformed = JSON.stringify([
      { id: 'good', title: 'ok', createdAt: 0 },
      { id: 'no-title' },
      'string entry',
      { id: 'no-created-at', title: 'x' },
    ])
    withLocalStorage(malformed, () => {
      const tasks = loadTasks()
      expect(tasks).toHaveLength(1)
      expect(tasks[0]!.id).toBe('good')
    })
  })
})

describe('exportMarkdown', () => {
  it('renders open and done entries with checkbox markers', () => {
    const md = exportMarkdown([
      makeTask({ id: 'a', title: 'open', priority: 'high', done: false }),
      makeTask({ id: 'b', title: 'done', priority: 'low', done: true }),
    ])
    const lines = md.split('\n')
    expect(lines[0]).toMatch(/^- \[ \] \[high\] open/)
    expect(lines[1]).toMatch(/^- \[x\] \[low\] done/)
  })

  it('emits due dates when present', () => {
    const md = exportMarkdown([
      makeTask({ id: 'a', title: 'a', priority: 'medium', dueDate: '2026-12-01' }),
    ])
    expect(md).toContain('due 2026-12-01')
  })

  it('emits a stable id comment on every row', () => {
    const md = exportMarkdown([
      makeTask({ id: 'stable-id', title: 'a' }),
    ])
    expect(md).toContain('<!-- id: stable-id -->')
  })
})

describe('exportJson', () => {
  it('returns a parseable JSON array', () => {
    const out = exportJson([
      makeTask({ id: 'a', title: 'a' }),
      makeTask({ id: 'b', title: 'b' }),
    ])
    const parsed: unknown = JSON.parse(out)
    expect(Array.isArray(parsed)).toBe(true)
  })
})