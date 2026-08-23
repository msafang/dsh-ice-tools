import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type { Disposer, DispatchClientService } from '../core/dsh-adapter/index.ts'
import { DEFAULT_ENABLED, OPTIONAL_MODULE_NAMES, type EnabledModules, type ModuleName } from '../core/dispatch/index.ts'
import { mount as mountChatRecovery } from '../modules/chat-recovery/client.ts'
import { mount as mountDesktopLauncher } from '../modules/desktop-launcher/client.ts'
import { mount as mountDoctor } from '../modules/doctor/client.ts'
import { mount as mountGitGraph } from '../modules/git-graph/client.ts'
import { mount as mountPluginManager } from '../modules/plugin-manager/client.ts'
import { mount as mountSessionId } from '../modules/session-id/client.ts'
import { mount as mountSkillExplorer } from '../modules/skill-explorer/client.ts'
import { mount as mountTaskBoard } from '../modules/task-board/client.ts'
import { mount as mountSettingsHub } from '../modules/settings-hub/client.ts'

export const inject = ['slots', 'locale', 'settingsScope', 'connection'] as const

type ClientMount = (ctx: ClientContext) => void | Disposer

const CLIENT_MOUNTS: Record<ModuleName, ClientMount> = {
  settingsHub: mountSettingsHub,
  pluginManager: mountPluginManager,
  chatRecovery: mountChatRecovery,
  desktopLauncher: mountDesktopLauncher,
  doctor: mountDoctor,
  sessionId: mountSessionId,
  skillExplorer: mountSkillExplorer,
  gitGraph: mountGitGraph,
  taskBoard: mountTaskBoard,
}

function disposeAll(disposers: readonly Disposer[]): void {
  for (let index = disposers.length - 1; index >= 0; index -= 1) disposers[index]()
}

export function apply(ctx: ClientContext): void {
  ctx.effect(() => {
    const service = ctx.get('iceToolsDispatch') as DispatchClientService | undefined
    const enabled: EnabledModules = { ...DEFAULT_ENABLED, ...service?.readEnabled?.() }
    const disposers: Disposer[] = []
    const settingsDisposer = CLIENT_MOUNTS.settingsHub(ctx)
    if (typeof settingsDisposer === 'function') disposers.push(settingsDisposer)

    for (const name of OPTIONAL_MODULE_NAMES) {
      if (enabled[name] !== true) continue
      const disposer = CLIENT_MOUNTS[name](ctx)
      if (typeof disposer === 'function') disposers.push(disposer)
    }

    return () => disposeAll(disposers)
  }, 'dsh-ice-tools client mounts')
}

export { enableSettingsCard, renderSettingsCard } from '../modules/settings-hub/client.ts'
