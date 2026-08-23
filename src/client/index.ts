import type { IceContext } from '../core/dsh-adapter/index.ts'
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

type ClientMount = (ctx: IceContext) => unknown

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

export interface ClientMountResult {
  readonly mounted: ModuleName[]
  readonly skipped: ModuleName[]
  readonly settingsCard?: unknown
}

export function mount(ctx: IceContext, input?: Partial<EnabledModules>): ClientMountResult {
  const serviceEnabled = ctx.services?.iceToolsDispatch?.readEnabled?.()
  const enabled = { ...DEFAULT_ENABLED, ...serviceEnabled, ...input }
  const mounted: ModuleName[] = []
  const skipped: ModuleName[] = []
  const settingsCard = CLIENT_MOUNTS.settingsHub(ctx)
  mounted.push('settingsHub')

  for (const name of OPTIONAL_MODULE_NAMES) {
    if (enabled[name] === true) {
      CLIENT_MOUNTS[name](ctx)
      mounted.push(name)
    } else {
      skipped.push(name)
    }
  }

  return { mounted, skipped, settingsCard }
}

export { enableSettingsCard, renderSettingsCard } from '../modules/settings-hub/client.ts'
