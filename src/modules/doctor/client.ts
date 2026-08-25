/**
 * Doctor: client-side environment check. Probes the live DSH runtime the
 * browser already has access to (settings transport, locale runtime, slots)
 * and surfaces the result in the ICE Tools settings page.
 *
 * Every check runs over the already-injected Cordis services, so no host-side
 * service registration is required. The Host-registered schema and its
 * describe view are inspected through `connection.api.settings.describe`.
 *
 * A handful of checks inspect the local browser environment and the plugin's
 * own integrity: a bundle-hash fingerprint under localStorage (so a stale
 * bundle reads as Fail), bilingual parity of the locale dictionaries, the
 * module loader registry, and a few platform APIs the rest of the plugin
 * depends on (clipboard, localStorage, fetch).
 */
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import { MODULE_NAMES, type ModuleName } from '../../core/dispatch/index.ts'
import { en } from '../../i18n/en.ts'
import { zh } from '../../i18n/zh.ts'

export type CheckKey =
  | 'connection'
  | 'settingsDescribe'
  | 'namespaceRegistered'
  | 'schemaSerializable'
  | 'providerWritable'
  | 'localeActive'
  | 'enabledKeys'
  | 'bundleHash'
  | 'localeCoverage'
  | 'moduleLoader'
  | 'clipboardApi'
  | 'localStorageApi'
  | 'fetchApi'

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

/** Minimal untyped face over `window.__ModuleLoader__`. */
interface ModuleLoaderLike {
  [key: string]: unknown
}

const BUNDLE_HASH_STORAGE_KEY = 'dsh-ice-tools.bundleHash'

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

/** Browser-safe SHA-256 hex digest. Returns undefined if SubtleCrypto is unavailable. */
async function sha256Hex(text: string): Promise<string | undefined> {
  if (typeof crypto === 'undefined' || crypto.subtle === undefined) return undefined
  try {
    const bytes = new TextEncoder().encode(text)
    const buffer = await crypto.subtle.digest('SHA-256', bytes)
    const view = new Uint8Array(buffer)
    let out = ''
    for (let i = 0; i < view.length; i += 1) {
      out += view[i]!.toString(16).padStart(2, '0')
    }
    return out
  } catch {
    return undefined
  }
}

/**
 * Pull the bundle source from the page. The module loader may expose the
 * factory at `window.__ModuleLoader__['dsh-ice-tools']`; failing that, we
 * fall back to the URL of the script tag that loaded dist/client.js so the
 * hash at least pins the source location (a server-side redeploy will flip
 * it). Both paths together let the check work in the common DSH shipping
 * setups without coupling to one host's loader shape.
 */
function readBundleSource(): string | undefined {
  if (typeof window === 'undefined') return undefined
  const loader = (window as unknown as { __ModuleLoader__?: ModuleLoaderLike }).__ModuleLoader__
  const entry = loader?.['dsh-ice-tools']
  if (typeof entry === 'string') return entry
  if (entry !== undefined && typeof (entry as { source?: unknown }).source === 'string') {
    return (entry as { source: string }).source
  }
  if (typeof document === 'undefined') return undefined
  const scripts = document.querySelectorAll<HTMLScriptElement>('script[src*="dsh-ice-tools/client.js"]')
  for (const script of scripts) {
    const src = script.getAttribute('src')
    if (src !== null) return `script:${src}`
  }
  return undefined
}

async function checkBundleHash(): Promise<{ pass: boolean; note: string }> {
  if (typeof window === 'undefined') return { pass: false, note: 'no window' }
  const source = readBundleSource()
  if (source === undefined) return { pass: false, note: 'bundle source unavailable' }
  const hash = await sha256Hex(source)
  if (hash === undefined) return { pass: false, note: 'crypto.subtle unavailable' }
  const stored = window.localStorage?.getItem(BUNDLE_HASH_STORAGE_KEY) ?? null
  if (stored === null) {
    try { window.localStorage?.setItem(BUNDLE_HASH_STORAGE_KEY, hash) } catch { /* ignore */ }
    return { pass: true, note: `fingerprint recorded (${hash.slice(0, 8)}…)` }
  }
  return stored === hash
    ? { pass: true, note: `match (${hash.slice(0, 8)}…)` }
    : { pass: false, note: `stored ${stored.slice(0, 8)}… vs current ${hash.slice(0, 8)}…` }
}

function checkLocaleCoverage(): { pass: boolean; note: string } {
  const zhKeys = new Set(Object.keys(zh.modules))
  const enKeys = new Set(Object.keys(en.modules))
  const missingInEn: string[] = []
  for (const key of zhKeys) {
    if (!enKeys.has(key)) missingInEn.push(key)
  }
  const missingInZh: string[] = []
  for (const key of enKeys) {
    if (!zhKeys.has(key)) missingInZh.push(key)
  }
  if (missingInEn.length === 0 && missingInZh.length === 0) {
    return { pass: true, note: `${zhKeys.size} modules in both dictionaries` }
  }
  const parts: string[] = []
  if (missingInEn.length > 0) parts.push(`missing in en: ${missingInEn.join(', ')}`)
  if (missingInZh.length > 0) parts.push(`missing in zh: ${missingInZh.join(', ')}`)
  return { pass: false, note: parts.join('; ') }
}

function checkModuleLoader(): { pass: boolean; note: string } {
  if (typeof window === 'undefined') return { pass: false, note: 'no window' }
  const loader = (window as unknown as { __ModuleLoader__?: ModuleLoaderLike }).__ModuleLoader__
  if (loader === undefined) return { pass: false, note: 'window.__ModuleLoader__ is undefined' }
  const registered = loader['dsh-ice-tools'] !== undefined
  return registered
    ? { pass: true, note: 'dsh-ice-tools factory registered' }
    : { pass: false, note: 'loader present but dsh-ice-tools not registered' }
}

function checkClipboardApi(): { pass: boolean; note: string } {
  if (typeof navigator === 'undefined') return { pass: false, note: 'no navigator' }
  const writeText = navigator.clipboard?.writeText
  if (typeof writeText !== 'function') return { pass: false, note: 'navigator.clipboard.writeText missing' }
  return { pass: true, note: 'secure context API present' }
}

function checkLocalStorageApi(): { pass: boolean; note: string } {
  if (typeof window === 'undefined') return { pass: false, note: 'no window' }
  const store = window.localStorage
  if (store === undefined) return { pass: false, note: 'window.localStorage undefined' }
  const probeKey = `${BUNDLE_HASH_STORAGE_KEY}.probe`
  try {
    store.setItem(probeKey, '1')
    const read = store.getItem(probeKey)
    store.removeItem(probeKey)
    return read === '1'
      ? { pass: true, note: 'read/write/remove round-trip ok' }
      : { pass: false, note: 'round-trip mismatch' }
  } catch (error) {
    return { pass: false, note: `threw: ${error instanceof Error ? error.message : String(error)}` }
  }
}

function checkFetchApi(): { pass: boolean; note: string } {
  if (typeof fetch !== 'function') return { pass: false, note: 'fetch is not a function' }
  if (typeof AbortController !== 'function') return { pass: false, note: 'AbortController is not a function' }
  return { pass: true, note: 'fetch + AbortController present' }
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

  // 8. bundle fingerprint (client-only integrity check)
  const bundleCheck = await checkBundleHash()
  results.push({ key: 'bundleHash', pass: bundleCheck.pass, note: bundleCheck.note })

  // 9. locale coverage (en vs zh parity)
  const coverageCheck = checkLocaleCoverage()
  results.push({ key: 'localeCoverage', pass: coverageCheck.pass, note: coverageCheck.note })

  // 10. module loader registry entry
  const loaderCheck = checkModuleLoader()
  results.push({ key: 'moduleLoader', pass: loaderCheck.pass, note: loaderCheck.note })

  // 11. clipboard API
  const clipboardCheck = checkClipboardApi()
  results.push({ key: 'clipboardApi', pass: clipboardCheck.pass, note: clipboardCheck.note })

  // 12. localStorage API
  const storageCheck = checkLocalStorageApi()
  results.push({ key: 'localStorageApi', pass: storageCheck.pass, note: storageCheck.note })

  // 13. fetch + AbortController
  const fetchCheck = checkFetchApi()
  results.push({ key: 'fetchApi', pass: fetchCheck.pass, note: fetchCheck.note })

  return { results, ranAt: Date.now() }
}