import { GM_ADD_STYLE, INTRO_FOR_PLACEHOLDER, PROD_MODE } from 'common/constant'
import { readBundleFile, writeBundleFile } from 'common/utils'
import { generateTmHeader } from './tm-header'
import type { Plugin } from 'vite'
import type { TMExternalGlobals } from './plugin'

export function injectMetaAndCss(input: TMExternalGlobals): Partial<Plugin> {
  if (process.env.NODE_ENV != PROD_MODE) return {}
  const allCss: string[] = []
  return {
    name: 'inject-meta-css',
    transform(code, id) {
      if (/\.(c|le|sc)ss$/.test(id)) {
        allCss.push(code)
        return { code: '' }
      }
    },
    writeBundle({ dir }, bundle) {
      for (const [fileName, bundleValue] of Object.entries(bundle)) {
        let result = readBundleFile(dir, fileName)
        const hasCss = allCss.length > 0
        result = result.replace(
          INTRO_FOR_PLACEHOLDER,
          hasCss
            ? `${GM_ADD_STYLE}(${['`', ...allCss, '`'].join('\n')})`
            : ''
        )
        if (bundleValue.type === 'chunk') {
          for (const [moduleKey, moduleValue] of Object.entries(bundleValue.modules)) {
            if (/\.(c|le|sc)ss$/.test(moduleKey) && moduleValue.code) {
              const csscode = moduleValue.code.replaceAll('\'', '"')
              result = result.replace(csscode, '')
            }
          }
        }
        result = generateTmHeader(PROD_MODE, input, hasCss) + '\n\n' + result
        writeBundleFile(dir, fileName, result)
      }
    }
  }
}
