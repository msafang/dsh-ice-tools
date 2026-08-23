import type { Context } from '@deepseek-ai/cordis'
import type { Disposer, LocaleService } from './core/dsh-adapter/index.ts'
import { ConfigStore } from './core/config-store/index.ts'
import {
  createDispatchService,
  type ModuleAppliers,
  type OptionalModuleName,
  type OptionalDispatchResult,
} from './core/dispatch/index.ts'
import { en } from './i18n/en.ts'
import { zh } from './i18n/zh.ts'
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

interface LocaleContext extends Context {
  readonly locale?: LocaleService
}

export function apply(ctx: Context): OptionalDispatchResult {
  const settingsDisposer = applySettingsHub(ctx)
  const store = new ConfigStore(ctx.get('homeDir') as string | undefined)
  const dispatch = createDispatchService(ctx, store, OPTIONAL_APPLIERS)
  const unprovide = () => {
    ctx.set('iceToolsDispatch', undefined)
  }
  const localeDisposer = (ctx as LocaleContext).locale?.register('ice-tools', { zh, en })
  const mounted = dispatch.mount()
  const cleanup: Disposer[] = [
    settingsDisposer,
    dispatch.disposeAll,
    () => {
      void unprovide()
    },
  ]
  if (typeof localeDisposer === 'function') cleanup.push(localeDisposer)

  ctx.effect(() => {
    return () => {
      for (let index = cleanup.length - 1; index >= 0; index -= 1) cleanup[index]()
    }
  }, 'dsh-ice-tools host cleanup')

  return mounted.result
}

export type { OptionalModuleName }
