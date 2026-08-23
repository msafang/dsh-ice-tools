export type Disposer = () => void

export interface SettingsLabel {
  readonly zh: string
  readonly en: string
}

export interface ReactElementLike {
  readonly type: string
  readonly props: Readonly<Record<string, unknown>>
}

export interface SettingsSectionOptions {
  readonly id: string
  readonly order: number
  readonly label: SettingsLabel
  readonly render: () => Promise<unknown> | unknown
}

export interface SettingsService {
  readonly installSettingsSection?: (options: SettingsSectionOptions) => void | Disposer
}

export interface DispatchClientService {
  readonly readEnabled?: () => Readonly<Record<string, boolean>>
  readonly setEnabled?: (name: string, enabled: boolean) => void
  readonly tick?: () => unknown
}

export interface IceContext {
  /** DSH services are supplied by Cordis at runtime, not imported by value. */
  readonly services?: {
    readonly settings?: SettingsService
    readonly iceToolsDispatch?: DispatchClientService
  }
  /** Optional provider hook used by the host adapter to expose its service. */
  readonly provide?: (name: string, service: unknown) => void
  /** Cross-plugin collaboration surfaces remain injected service boundaries. */
  readonly slots?: {
    readonly settings?: {
      readonly register?: (element: ReactElementLike) => void
    }
  }
  readonly sessions?: unknown
  readonly workspaces?: unknown
  readonly homeDir?: string
}

/**
 * Typed shim for the upstream settings service. A real DSH context supplies
 * `services.settings`; tests can use the same surface without installing DSH.
 */
export function installSettingsSection(
  ctx: IceContext,
  options: SettingsSectionOptions,
): SettingsSectionOptions | Disposer {
  const installer = ctx.services?.settings?.installSettingsSection
  if (installer === undefined) return options
  return installer(options) ?? options
}
