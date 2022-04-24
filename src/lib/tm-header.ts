import { DEV_MODE, tmHeaderKeys } from 'common/constant'
import { buildRequireCDN, getDefinedConfig, readPackageJSON } from 'common/utils'
import { addExtraTmGrant, addUsedGrants } from './grants'
import type { Nested } from 'common/type'
import type { TmHeaderConfig, TmHeaderConfigKeys } from 'common/constant'
import type { TMExternalGlobals } from './plugin'

type DealMetaFunction = (v: Nested<string>) => string | Nested<string>[]

export function generateTmHeader(mode: string, input: TMExternalGlobals, hasCss: boolean) {
  const definedConfig = getDefinedConfig() ?? {}
  if (typeof definedConfig == 'string') return definedConfig
  const packageJson = readPackageJSON()
  const config: TmHeaderConfig = {}
  for (const key of tmHeaderKeys) {
    const value = definedConfig[key] ?? packageJson[key]
    if (value) config[key] = value
  }
  config.require = [...config.require ?? [], ...buildRequireCDN(input)]
  if (mode === DEV_MODE) {
    addUsedGrants(config, true)
    config.name += '-vite-dev'
  } else {
    hasCss && addExtraTmGrant(config)
    addUsedGrants(config)
  }
  const definedMetaKeys = Object.keys(config) as TmHeaderConfigKeys
  const maxKeyLength = Math.max(...definedMetaKeys.map(k => k.length))
  const definedMetaBlock = definedMetaKeys.flatMap(key => {
    const value = config[key] as Nested<string>
    const spaces = Array.from({ length: maxKeyLength - key.length + 8 }).join(' ')
    const dealMeta: DealMetaFunction = v => {
      if (Array.isArray(v)) return v.map(element => dealMeta(element))
      if (typeof v == 'boolean' && v === true) return `// @${key}`
      return `// @${key}${spaces}${v}`
    }
    return dealMeta(value)
  })
  return [
    '// ==UserScript==',
    ...definedMetaBlock,
    '// ==/UserScript==',
  ].join('\n')
}
