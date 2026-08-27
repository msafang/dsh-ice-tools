/**
 * taskBoard: a tiny client-only task list with localStorage persistence.
 * The Host would normally own the file-backed tasks.json store, but for a
 * browser-resident plug we keep the data local so a single profile still has
 * a working checklist without depending on a cross-fiber write service. A
 * future revision can swap the storage layer for a Host RPC and keep the
 * public surface (loadTasks, addTask, toggleTask, removeTask) unchanged.
 */

export type Priority = 'high' | 'medium' | 'low'

export interface Task {
  readonly id: string
  readonly title: string
  readonly done: boolean
  readonly createdAt: number
  readonly priority: Priority
  readonly dueDate?: string
  readonly blockedBy?: readonly string[]
  readonly order: number
}

export type StatusFilter = 'all' | 'open' | 'done' | 'overdue'

export interface TaskTemplate {
  readonly id: string
  readonly title: string
  readonly priority: Priority
  readonly dueOffsetDays?: number
}

export const TASK_STORAGE_KEY = 'dsh-ice-tools.tasks.v1'

export const TASK_TEMPLATES: readonly TaskTemplate[] = [
  { id: 'bug', title: 'Fix bug', priority: 'high' },
  { id: 'review', title: 'Review PR', priority: 'medium', dueOffsetDays: 1 },
  { id: 'docs', title: 'Update docs', priority: 'low', dueOffsetDays: 7 },
  { id: 'test', title: 'Write test', priority: 'medium', dueOffsetDays: 3 },
]

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

function safeStorage(): Storage | undefined {
  const g = (typeof globalThis !== 'undefined' ? globalThis : undefined) as
    | { localStorage?: Storage; window?: { localStorage?: Storage } }
    | undefined
  const store = g?.window?.localStorage ?? g?.localStorage
  if (store === undefined) return undefined
  return store
}

export function isValidIsoDate(value: unknown): value is string {
  return typeof value === 'string' && ISO_DATE.test(value)
}

export function todayIso(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function isoOffsetDays(days: number): string {
  const now = new Date()
  now.setDate(now.getDate() + days)
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function isOverdue(task: Pick<Task, 'done' | 'dueDate'>, today: string = todayIso()): boolean {
  if (task.done) return false
  if (!isValidIsoDate(task.dueDate)) return false
  return task.dueDate < today
}

/** A task is blocked when any of its blocker IDs is still open in the task list. */
export function isBlocked(task: Pick<Task, 'blockedBy'>, allTasks: readonly Task[]): boolean {
  const ids = task.blockedBy
  if (ids === undefined || ids.length === 0) return false
  for (const id of ids) {
    const blocker = allTasks.find((t) => t.id === id)
    if (blocker !== undefined && !blocker.done) return true
  }
  return false
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
      const priority = candidate.priority === 'high' || candidate.priority === 'medium' || candidate.priority === 'low'
        ? candidate.priority
        : 'medium'
      const done = candidate.done === true
      const order = typeof candidate.order === 'number' ? candidate.order : tasks.length
      const dueDate = isValidIsoDate(candidate.dueDate) ? candidate.dueDate : undefined
      const blockedBy = Array.isArray(candidate.blockedBy)
        ? candidate.blockedBy.filter((id): id is string => typeof id === 'string')
        : undefined
      tasks.push({
        id: candidate.id,
        title: candidate.title,
        done,
        createdAt: candidate.createdAt,
        priority,
        order,
        ...(dueDate !== undefined ? { dueDate } : {}),
        ...(blockedBy !== undefined && blockedBy.length > 0 ? { blockedBy } : {}),
      })
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

function newId(): string {
  return `t${Date.now().toString(36)}${Math.floor(Math.random() * 1e6).toString(36)}`
}

export function addTask(
  tasks: readonly Task[],
  title: string,
  options: { readonly priority?: Priority; readonly dueDate?: string } = {},
): readonly Task[] {
  const trimmed = title.trim()
  if (trimmed.length === 0) return tasks
  const priority = options.priority ?? 'medium'
  const dueDate = isValidIsoDate(options.dueDate) ? options.dueDate : undefined
  const minOrder = tasks.reduce((acc, task) => Math.min(acc, task.order), 0)
  const next: Task = {
    id: newId(),
    title: trimmed,
    done: false,
    createdAt: Date.now(),
    priority,
    order: minOrder - 1,
    ...(dueDate !== undefined ? { dueDate } : {}),
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

export function setPriority(tasks: readonly Task[], id: string, priority: Priority): readonly Task[] {
  const updated = tasks.map((task) => task.id === id ? { ...task, priority } : task)
  persist(updated)
  return updated
}

export function setDueDate(tasks: readonly Task[], id: string, dueDate: string | undefined): readonly Task[] {
  // An empty string from a cleared date input is treated like undefined;
  // callers that want to set an explicit value pass a non-empty ISO date.
  const cleared = dueDate === undefined || dueDate === ''
  const updated = tasks.map((task) => task.id === id
    ? (cleared ? (() => { const { dueDate: _drop, ...rest } = task; void _drop; return rest })() : { ...task, dueDate: dueDate as string })
    : task)
  persist(updated)
  return updated
}

export function moveTask(tasks: readonly Task[], id: string, direction: -1 | 1): readonly Task[] {
  const index = tasks.findIndex((task) => task.id === id)
  if (index === -1) return tasks
  const target = index + direction
  if (target < 0 || target >= tasks.length) return tasks
  const next = tasks.slice()
  const swap = next[index]!
  next[index] = next[target]!
  next[target] = swap
  return next.map((task, idx) => idx === index || idx === target ? { ...task, order: tasks[idx]!.order } : task).map((task) => task)
    .map((task, idx) => ({ ...task, order: idx }))
}

/** Filter the task list through a status selector and a search query. */
export function filterTasks(
  tasks: readonly Task[],
  status: StatusFilter,
  query: string,
  today: string = todayIso(),
): readonly Task[] {
  const needle = query.trim().toLowerCase()
  const predicate = (task: Task): boolean => {
    if (status === 'open' && task.done) return false
    if (status === 'done' && !task.done) return false
    if (status === 'overdue' && !isOverdue(task, today)) return false
    if (needle.length > 0 && !task.title.toLowerCase().includes(needle)) return false
    return true
  }
  return tasks.filter(predicate)
}

/** Sort the task list: open tasks before done, higher priority first, then by order. */
export function sortTasks(tasks: readonly Task[]): readonly Task[] {
  const priorityWeight: Record<Priority, number> = { high: 0, medium: 1, low: 2 }
  return tasks.slice().sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1
    const pa = priorityWeight[a.priority]
    const pb = priorityWeight[b.priority]
    if (pa !== pb) return pa - pb
    return a.order - b.order
  })
}

/** Export the task list as a stable JSON string. */
export function exportJson(tasks: readonly Task[]): string {
  return JSON.stringify(tasks, null, 2)
}

/**
 * Export the task list as a Markdown checklist. Open tasks render with
 * `- [ ]`, done tasks with `- [x]`. Each row carries a `<!-- id: ... -->`
 * comment so a future re-import can preserve identity.
 */
export function exportMarkdown(tasks: readonly Task[]): string {
  const lines: string[] = []
  for (const task of tasks) {
    const box = task.done ? '[x]' : '[ ]'
    const due = task.dueDate === undefined ? '' : ` (due ${task.dueDate})`
    const priority = `[${task.priority}]`
    lines.push(`- ${box} ${priority} ${task.title}${due} <!-- id: ${task.id} -->`)
  }
  return lines.join('\n')
}