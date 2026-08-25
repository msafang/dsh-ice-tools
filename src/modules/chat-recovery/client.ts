/**
 * chatRecovery: client-only placeholder. Surfacing recoverable failed
 * sessions requires the Host session registry and the failed-turn event
 * stream; the plugin does not yet own either, so the settings page shows
 * the current state ("no host hook") instead of pretending to a recovery
 * list. A future revision can subscribe to the Host's failure event and
 * surface one-click recovery entries.
 */

export interface ChatRecoveryState {
  readonly status: 'requires-host'
}

export function readChatRecoveryState(): ChatRecoveryState {
  return { status: 'requires-host' }
}