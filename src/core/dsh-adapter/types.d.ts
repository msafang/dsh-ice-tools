/**
 * Type declarations for the upstream DSH SDK. These are declared locally
 * because @deepseek-ai/* packages are not available on the public npm registry;
 * they are provided by the DSH host at runtime via Cordis injection.
 *
 * This file uses `declare module` so TypeScript can typecheck without
 * installing the actual packages. The declarations are minimal and only
 * cover the surfaces this package actually uses.
 */

declare module '@deepseek-ai/cordis' {
  export interface Context {
    get(name: string): unknown
    set(name: string, value: unknown): void
    effect(fn: () => void | (() => void), label?: string): void
    on(event: string, listener: (...args: unknown[]) => void): () => void
  }
}

declare module '@deepseek-ai/dsh-client-runtime/client' {
  import type { Context } from '@deepseek-ai/cordis'

  export interface SettingsScope<T = Record<string, unknown>> {
    getSnapshot(): {
      status: 'loading' | 'ready' | 'unavailable'
      value: T | undefined
    }
    subscribe(listener: () => void): () => void
    set(field: string, value: unknown): Promise<void>
    unset(field: string): Promise<void>
  }

  export interface ClientContext extends Context {
    readonly slots: {
      inject(name: string, factory: () => () => void): void
      register(spec: Record<string, unknown>, component: unknown): () => void
    }
    readonly locale: {
      register(namespace: string, dictionaries: { zh: unknown; en: unknown }): void | (() => void)
      bind(namespace: string): (key: string) => string
    }
    readonly settingsScope: {
      bind<T>(spec: { namespace: string; decode?: (section: unknown) => T | undefined }): SettingsScope<T>
    }
  }
}
