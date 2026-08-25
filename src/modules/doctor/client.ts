/**
 * Doctor: client-side environment check. Probes the live DSH runtime the
 * browser already has access to (settings transport, locale runtime, slots)
 * and surfaces the result in the ICE Tools settings page.
 *
 * Every check runs over the already-injected Cordis services, so no host-side
 * service registration is required. The Host-registered schema and its
 * describe view are inspected through `connection.api.settings.describe`.
 */
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import { MODULE_NAMES, type ModuleName } from '../../core/dispatch/index.ts'

export type CheckKey =
  | 'connection'
  | 'settingsDescribe'
  | 'namespaceRegistered'
  | 'schemaSerializable'
  | 'providerWritable'
  | 'localeActive'
  | 'enabledKeys'

export interface CheckResult {
  readonly key: CheckKey
  readonly pass: boolean
  readonly note: string
}

export interface DoctorRun {
  readonly results: readonly CheckResult[]
  readonly ranAt: number
}

/** Minimal untyped face over `ctx.get('connection').api.settings.describe`. */
interface ConnectionLike {
  api: {
    settings: {
      describe(input: object): Promise<{
        result: { ok: true; value: unknown } | { ok: false; error: { message: string } }
      }>
    }
  }
}

interface LocaleRuntimeLike {
  getSnapshot(): { readonly active: string; readonly revision: number }
}

interface DescribeView {
  writable?: boolean
  namespaces?: ReadonlyArray<{
    ns: string
    value?: unknown
    schema?: unknown
  }>
}

/**
 * Read the full settings describe view through the loopback connection. The
 * `settings.describe` RPC accepts an optional redactSecrets flag; we pass
 * `{}` so we receive the verbatim view (the doctor inspects structure only,
 * never returns secrets).
 */
async function readDescribe(ctx: ClientContext): Promise<DescribeView | string> {
  const conn = ctx.get('connection') as ConnectionLike | undefined
  if (conn === undefined) return 'connection service missing'
  const response = await conn.api.settings.describe({})
  if (!response.result.ok) return response.result.error.message
  return (response.result.value ?? {}) as DescribeView
}

function checkEnabledKeys(value: unknown): { pass: boolean; note: string } {
  if (typeof value !== 'object' || value === null) {
    return { pass: false, note: `value is ${typeof value}` }
  }
  const enabled = (value as { enabled?: unknown }).enabled
  if (typeof enabled !== 'object' || enabled === null) {
    return { pass: false, note: 'enabled field missing' }
  }
  const missing: ModuleName[] = []
  for (const name of MODULE_NAMES) {
    if (typeof (enabled as Record<string, unknown>)[name] !== 'boolean') missing.push(name)
  }
  return missing.length === 0
    ? { pass: true, note: `${MODULE_NAMES.length} keys present` }
    : { pass: false, note: `missing: ${missing.join(', ')}` }
}

function checkSchemaSerializable(schema: unknown): { pass: boolean; note: string } {
  if (schema === undefined || schema === null) {
    return { pass: false, note: 'schema absent' }
  }
  if (typeof schema !== 'object') {
    return { pass: false, note: `schema is ${typeof schema}` }
  }
  return { pass: true, note: `shape: ${Object.keys(schema as object).slice(0, 3).join(', ')}` }
}

/**
 * Run the doctor once. Returns a snapshot the caller can render; the function
 * is pure with respect to the context (no long-lived listeners are created)
 * so a settings page can run it on demand without extra cleanup.
 */
export async function runDoctor(ctx: ClientContext): Promise<DoctorRun> {
  const results: CheckResult[] = []

  // 1. Connection handle
  const conn = ctx.get('connection') as ConnectionLike | undefined
  results.push({
    key: 'connection',
    pass: conn !== undefined,
    note: conn === undefined ? 'ctx.get("connection") returned undefined' : 'present',
  })

  // 2. settings.describe RPC
  let describeView: DescribeView | undefined
  if (conn === undefined) {
    results.push({ key: 'settingsDescribe', pass: false, note: 'skipped: no connection' })
  } else {
    const outcome = await readDescribe(ctx)
    if (typeof outcome === 'string') {
      results.push({ key: 'settingsDescribe', pass: false, note: outcome })
    } else {
      describeView = outcome
      results.push({
        key: 'settingsDescribe',
        pass: true,
        note: `namespaces: ${outcome.namespaces?.length ?? 0}`,
      })
    }
  }

  // 3. ice-tools namespace registered
  const iceTools = describeView?.namespaces?.find((row) => row.ns === 'ice-tools')
  results.push({
    key: 'namespaceRegistered',
    pass: iceTools !== undefined,
    note: iceTools === undefined ? 'missing in describe.namespaces' : `revision: ${(iceTools as { revision?: number }).revision ?? '?'}`,
  })

  // 4. schema serializable
  const schemaCheck = iceTools === undefined
    ? { pass: false, note: 'skipped: namespace not registered' }
    : checkSchemaSerializable((iceTools as { schema?: unknown }).schema)
  results.push({ key: 'schemaSerializable', pass: schemaCheck.pass, note: schemaCheck.note })

  // 5. provider writable
  const writable = describeView?.writable === true
  results.push({
    key: 'providerWritable',
    pass: writable,
    note: writable ? 'describe.writable === true' : 'describe.writable is not true',
  })

  // 6. locale active
  const locale = (ctx as unknown as { locale?: LocaleRuntimeLike }).locale
  let localePass = false
  let localeNote = 'locale service missing'
  if (locale !== undefined) {
    try {
      const snap = locale.getSnapshot()
      const active = typeof snap.active === 'string' && snap.active.length > 0
      localePass = active
      localeNote = `active: ${snap.active}`
    } catch (error) {
      localePass = false
      localeNote = `getSnapshot() threw: ${error instanceof Error ? error.message : String(error)}`
    }
  }
  results.push({ key: 'localeActive', pass: localePass, note: localeNote })

  // 7. enabled keys complete
  const enabledCheck = iceTools === undefined
    ? { pass: false, note: 'skipped: namespace not registered' }
    : checkEnabledKeys((iceTools as { value?: unknown }).value)
  results.push({ key: 'enabledKeys', pass: enabledCheck.pass, note: enabledCheck.note })

  return { results, ranAt: Date.now() }
}