import type { IceContext } from './core/dsh-adapter/index.ts'
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

export function apply(ctx: IceContext): OptionalDispatchResult {
  applySettingsHub(ctx)
  const store = new ConfigStore(ctx.homeDir)
  const dispatch = createDispatchService(ctx, store, OPTIONAL_APPLIERS)
  ctx.provide?.('iceToolsDispatch', dispatch)
  return dispatch.mount()
}

export type { OptionalModuleName }
