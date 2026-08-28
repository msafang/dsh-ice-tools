import type { UserConfig } from 'tsdown'
import { PLATFORM_MODULES } from './web-platform.ts'

/**
 * Minimal two-face preset for this package. The host and browser entries are
 * emitted separately so Node file access cannot enter the browser artifact.
 * The purity plugin rejects any browser value import from @deepseek-ai/* that
 * is not in the frozen platform seed table. Type-only imports are erased.
 *
 * The browser entry is emitted as CJS wrapped by `window.__ModuleLoader__.load
 * ({ id, factory })`, mirroring the contract used by the official harness
 * client bundles (see upstream packages/client/tsdown.client.ts). The
 * module loader calls the factory with its own `require`, which is how the
 * browser resolves Cordis DI identities from the loader module table.
 */
export function clientBundle(id: string, hostEntries: readonly string[]): UserConfig[] {
  return [
    {
      name: id,
      entry: { index: hostEntries[0] },
      outDir: 'dist',
      format: 'esm',
      platform: 'node',
      target: 'es2022',
      dts: false,
      sourcemap: false,
      minify: true,
      clean: true,
      fixedExtension: false,
    },
    {
      name: `${id}/client`,
      entry: { client: 'src/client/index.ts' },
      outDir: 'dist',
      format: 'cjs',
      platform: 'browser',
      target: 'es2022',
      dts: false,
      sourcemap: false,
      minify: true,
      clean: false,
      fixedExtension: false,
      deps: { neverBundle: [...PLATFORM_MODULES] },
      plugins: [
        {
          name: 'dsh-ice-tools-client-purity',
          resolveId(source: string) {
            if (!source.startsWith('@deepseek-ai/')) return null
            if (PLATFORM_MODULES.includes(source as PlatformModule)) return null
            throw new Error(
              `browser bundle purity: value import ${source} is not a platform seed module`,
            )
          },
        },
      ],
      outputOptions: {
        entryFileNames: 'client.js',
        banner: `window.__ModuleLoader__.load({ id: ${JSON.stringify(id)}, factory: (require) => {`,
        intro: 'var module = { exports: {} }; var exports = module.exports;',
        footer: 'return module.exports; } });',
      },
    },
  ]
}

type PlatformModule = (typeof PLATFORM_MODULES)[number]
