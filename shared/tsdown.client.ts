import type { UserConfig } from 'tsdown'
import { PLATFORM_MODULES } from './web-platform.ts'

/**
 * Minimal two-face preset for this package. The host and browser entries are
 * emitted separately so Node file access cannot enter the browser artifact.
 * The purity plugin rejects any browser value import from @deepseek-ai/* that
 * is not in the frozen platform seed table. Type-only imports are erased.
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
      sourcemap: true,
      clean: true,
      fixedExtension: false,
    },
    {
      name: `${id}/client`,
      entry: { client: 'src/client/index.ts' },
      outDir: 'dist',
      format: 'esm',
      platform: 'browser',
      target: 'es2022',
      dts: false,
      sourcemap: true,
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
    },
  ]
}

type PlatformModule = (typeof PLATFORM_MODULES)[number]
