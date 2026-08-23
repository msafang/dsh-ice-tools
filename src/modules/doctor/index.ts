import type { IceContext } from '../../core/dsh-adapter/index.ts'

export const name = 'ice-doctor'
export const stubOnly = true
export const descriptionKey = 'modules.doctor.description'

export function apply(ctx: IceContext): void {
  // Phase X: real implementation.
  void ctx
}
