/**
 * Browser modules supplied by the DSH Web GUI module table. Client code may
 * use these identities when a future implementation needs them, but this
 * scaffold intentionally uses only local pure TypeScript in the browser half.
 */
export const PLATFORM_MODULES = [
  'react',
  'react/jsx-runtime',
  '@deepseek-ai/cordis',
  '@deepseek-ai/dsh-client-ui-slots',
  '@deepseek-ai/dsh-client-ui-primitives',
] as const

export type PlatformModule = (typeof PLATFORM_MODULES)[number]
