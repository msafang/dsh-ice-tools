/**
 * taskBoard: a tiny client-only task list with localStorage persistence.
 * The Host would normally own the file-backed tasks.json store, but for a
 * browser-resident plug we keep the data local so a single profile still has
 * a working checklist without depending on a cross-fiber write service. A
 * future revision can swap the storage layer for a Host RPC and keep the
 * public surface (loadTasks, addTask, toggleTask, removeTask) unchanged.
 */

export interface Task {
  readonly id: string
  readonly title: string
  readonly done: boolean
  readonly createdAt: number
}

export const TASK_STORAGE_KEY = 'dsh-ice-tools.tasks.v1'

function safeStorage(): Storage | undefined {
  if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') return undefined
  return window.localStorage
}

export function loadTasks(): readonly Task[] {
  const store = safeStorage()
  if (store === undefined) return []
  const raw = store.getItem(TASK_STORAGE_KEY)
  if (raw === null) return []
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    const tasks: Task[] = []
    for (const item of parsed) {
      if (typeof item !== 'object' || item === null) continue
      const candidate = item as Record<string, unknown>
      if (typeof candidate.id !== 'string' || typeof candidate.title !== 'string') continue
      if (typeof candidate.createdAt !== 'number') continue
      const done = candidate.done === true
      tasks.push({ id: candidate.id, title: candidate.title, done, createdAt: candidate.createdAt })
    }
    return tasks
  } catch {
    return []
  }
}

function persist(tasks: readonly Task[]): void {
  const store = safeStorage()
  if (store === undefined) return
  try {
    store.setItem(TASK_STORAGE_KEY, JSON.stringify(tasks))
  } catch {
    // localStorage may be disabled (private browsing) or quota-exceeded.
    // The UI keeps the in-memory list regardless.
  }
}

export function addTask(tasks: readonly Task[], title: string): readonly Task[] {
  const trimmed = title.trim()
  if (trimmed.length === 0) return tasks
  const next: Task = {
    id: `t${Date.now().toString(36)}${Math.floor(Math.random() * 1e6).toString(36)}`,
    title: trimmed,
    done: false,
    createdAt: Date.now(),
  }
  const updated = [next, ...tasks]
  persist(updated)
  return updated
}

export function toggleTask(tasks: readonly Task[], id: string): readonly Task[] {
  const updated = tasks.map((task) => task.id === id ? { ...task, done: !task.done } : task)
  persist(updated)
  return updated
}

export function removeTask(tasks: readonly Task[], id: string): readonly Task[] {
  const updated = tasks.filter((task) => task.id !== id)
  persist(updated)
  return updated
}