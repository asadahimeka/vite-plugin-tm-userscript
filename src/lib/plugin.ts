import { generateClientCode } from './client-code'
import { generateTmHeader } from './tm-header'
import { parseGrant } from './grants'
import { getLibraryOptions, getRollupOptions } from './build-options'
import { DEV_MODE, GM_ADD_STYLE, INTRO_FOR_PLACEHOLDER, PROD_MODE } from 'common/constant'
import type { Plugin } from 'vite'
import type { AddressInfo } from 'node:net'

export interface TMPluginOptions {
  entry?: string;
  autoGrant?: boolean;
  externalGlobals?: string[] | Record<string, string | string[]>;
}
export type TMExternalGlobals = TMPluginOptions['externalGlobals']

type Address = AddressInfo | null | undefined

function generateDevelopmentCode(address: Address, input: TMExternalGlobals, entry?: string) {
  if (!address) return '\u5904\u7406\u5927\u5931\u8D25\u4E86\u55F7...'
  const tmHeader = generateTmHeader(DEV_MODE, input, true)
  const code = generateClientCode(address, entry)
  return `${tmHeader}\n\n(function () {\n${code}\n})()`
}

function getAddress(address: Address | string) {
  return typeof address == 'object' ? address : undefined
}

const DEV_TAMPERMONKEY_PATH = '/_development.user.js'
const showInstallLog = (address: AddressInfo) => {
  const url = `http://${address.address}:${address.port}${DEV_TAMPERMONKEY_PATH}`
  setTimeout(() => {
    console.log('\u001B[36m%s\u001B[0m', `> [TMPlugin] - click link to install userscript: ${url}`)
  })
}

export function tampermonkeyPlugin(options: TMPluginOptions = {}): Plugin[] {
  const { entry, externalGlobals, autoGrant } = options
  const { moduleParsed } = parseGrant(autoGrant)
  return [
    {
      name: 'tm-userscript-builder',
      moduleParsed,
      configureServer(server) {
        return () => {
          server.httpServer?.on('listening', () => {
            const address = getAddress(server.httpServer?.address())
            address && showInstallLog(address)
          })
          server.middlewares.use((request, response, next) => {
            if (request.url === DEV_TAMPERMONKEY_PATH) {
              const address = getAddress(server.httpServer?.address())
              const developmentCode = generateDevelopmentCode(address, externalGlobals, entry)
              response.setHeader('Cache-Control', 'no-store')
              response.write(developmentCode)
            }
            next()
          })
        }
      },
      config(config) {
        let hmr = config.server?.hmr
        if (typeof hmr === 'boolean' || !hmr) hmr = {}
        hmr.protocol = 'ws'
        hmr.host = '127.0.0.1'
        config.server = {
          ...config.server,
          hmr
        }
        config.build = {
          lib: getLibraryOptions(entry),
          rollupOptions: getRollupOptions(externalGlobals),
          minify: false,
          sourcemap: false,
          cssCodeSplit: false
        }
      }
    },
    {
      name: 'tm-userscript-inject',
      apply: 'build',
      enforce: 'post',
      generateBundle(_options, bundle) {
        const bundleKeys = Object.keys(bundle)
        const cssBundles = bundleKeys.filter(key => key.endsWith('.css'))
        const jsBundles = bundleKeys.filter(key => key.endsWith('.js'))
        const cssList = []
        for (const css of cssBundles) {
          const chunk = bundle[css]
          if (chunk.type === 'asset' && typeof chunk.source == 'string') {
            delete bundle[css]
            cssList.push(chunk.source)
            continue
          }
        }
        const hadCss = cssList.length > 0
        const tmHeader = generateTmHeader(PROD_MODE, externalGlobals, hadCss)
        for (const js of jsBundles) {
          const chunk = bundle[js]
          if (chunk.type === 'chunk') {
            let chunkCode = chunk.code
            for (const [moduleKey, moduleValue] of Object.entries(chunk.modules)) {
              if (/\.(c|le|sc)ss$/.test(moduleKey) && moduleValue.code) {
                const cssCode = moduleValue.code.replaceAll('\'', '"').replaceAll('#__PURE__', '@__PURE__')
                chunkCode = chunkCode.replace(cssCode, '')
              }
            }
            chunk.code = tmHeader + '\n\n' + chunkCode.replace(
              INTRO_FOR_PLACEHOLDER,
              hadCss ? `${GM_ADD_STYLE}(\`\n${cssList.join('\n')}  \`)` : ''
            )
          }
        }
      }
    }
  ]
}
