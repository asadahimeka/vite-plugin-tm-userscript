import type { TmHeaderConfig } from 'common/constant'

export { tampermonkeyPlugin as default } from 'lib/plugin'
export function defineTmHeader(options: TmHeaderConfig): TmHeaderConfig { return options }
