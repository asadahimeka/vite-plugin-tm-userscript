import { full as walkFull } from 'acorn-walk'
import { GM_ADD_STYLE, grants } from 'common/constant'
import type { Grant, Grants, TmHeaderConfig } from 'common/constant'
import type { Plugin } from 'vite'

const grantsSet = new Set<Grant>(grants)
const usedGrants = new Set<Grant>()

export function parseGrant(autoGrant: boolean | undefined): Partial<Plugin> {
  if (autoGrant === false) return {}
  return {
    name: 'tm-userscript-grant',
    moduleParsed(moduleInfo) {
      if (/\.(ts|js|vue)$/.test(moduleInfo.id) && moduleInfo.ast) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        walkFull(moduleInfo.ast, (node: any) => {
          if (node.type === 'CallExpression') {
            const calleeName = node.callee.name
            if (calleeName && grantsSet.has(calleeName)) {
              usedGrants.add(calleeName)
            }
          }
          if (node.type === 'Identifier' && grantsSet.has(node.name)) {
            usedGrants.add(node.name)
          }
        })
      }
    }
  }
}

export function addUsedGrants(tmConfig: TmHeaderConfig, isDevelopment = false) {
  if (isDevelopment) {
    tmConfig.grant = grants as Grants
    return
  }
  if (!Array.isArray(tmConfig.grant)) {
    tmConfig.grant = [tmConfig.grant].filter(Boolean) as Grants
  }
  tmConfig.grant = [...new Set([...tmConfig.grant, ...usedGrants])]
}

export function addExtraTmGrant(tmConfig: TmHeaderConfig) {
  if (!Array.isArray(tmConfig.grant)) {
    tmConfig.grant = [tmConfig.grant].filter(Boolean) as Grants
  }
  if (!tmConfig.grant.includes(GM_ADD_STYLE)) {
    tmConfig.grant.push(GM_ADD_STYLE)
  }
  return tmConfig
}
