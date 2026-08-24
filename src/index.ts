import type { Context } from '@deepseek-ai/cordis'
import type { Disposer } from './core/dsh-adapter/index.ts'
import { ConfigStore } from './core/config-store/index.ts'
import {
  createDispatchService,
  type ModuleAppliers,
  type OptionalModuleName,
  type OptionalDispatchResult,
} from './core/dispatch/index.ts'
import { apply as applyChatRecovery } from './modules/chat-recovery/index.ts'
import { apply as applyDesktopLauncher } from './modules/desktop-launcher/index.ts'
import { apply as applyDoctor } from './modules/doctor/index.ts'
import { apply as applyGitGraph } from './modules/git-graph/index.ts'
import { apply as applyPluginManager } from './modules/plugin-manager/index.ts'
import { apply as applySessionId } from './modules/session-id/index.ts'
import { apply as applySkillExplorer } from './modules/skill-explorer/index.ts'
import { apply as applyTaskBoard } from './modules/task-board/index.ts'
import { apply as applySettingsHub } from './modules/settings-hub/index.ts'

export const name = 'dsh-ice-tools'
export const stubOnly = false
export const inject = ['settings'] as const

const OPTIONAL_APPLIERS: ModuleAppliers = {
  pluginManager: applyPluginManager,
  chatRecovery: applyChatRecovery,
  desktopLauncher: applyDesktopLauncher,
  doctor: applyDoctor,
  sessionId: applySessionId,
  skillExplorer: applySkillExplorer,
  gitGraph: applyGitGraph,
  taskBoard: applyTaskBoard,
}

export function apply(ctx: Context): OptionalDispatchResult {
  const settingsDisposer = applySettingsHub(ctx)
  const store = new ConfigStore(ctx.get('homeDir') as string | undefined)
  const dispatch = createDispatchService(ctx, store, OPTIONAL_APPLIERS)
  const unprovide = () => {
    ctx.set('iceToolsDispatch', undefined)
  }
  // Locale dictionaries are owned by the client half: see src/client/index.ts.
  // The host fiber has no `locale` service, and the only consumer of the i18n
  // copy is the settings UI rendered in the browser. Reading `locale` here
  // would force the host bundle to wait on a service that the host chain
  // never provides.
  const mounted = dispatch.mount()
  const cleanup: Disposer[] = [
    settingsDisposer,
    dispatch.disposeAll,
    () => {
      void unprovide()
    },
  ]

  ctx.effect(() => {
    return () => {
      for (let index = cleanup.length - 1; index >= 0; index -= 1) cleanup[index]()
    }
  }, 'dsh-ice-tools host cleanup')

  return mounted.result
}

export type { OptionalModuleName }
