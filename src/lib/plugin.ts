import { generateClientCode } from './client-code'
import { generateTmHeader } from './tm-header'
import { getLibraryOptions, getRollupOptions } from './build-options'
import { injectMetaAndCss } from './inject'
import { parseGrant } from './grants'
import { DEV_MODE } from 'common/constant'
import type { Plugin } from 'vite'
import type { AddressInfo } from 'node:net'

export interface TMPluginOptions {
  entry?: string;
  autoGrant?: boolean;
  externalGlobals?: string[] | Record<string, string | string[]>;
}
export type TMExternalGlobals = TMPluginOptions['externalGlobals']

function generateDevelopmentCode(address: AddressInfo, input: TMExternalGlobals) {
  const tmHeader = generateTmHeader(DEV_MODE, input, true)
  return `${tmHeader}
  (function () {
    ${generateClientCode(address)}
  })()`
}

function getAddress(address: string | AddressInfo | null | undefined) {
  return typeof address == 'object' ? address : undefined
}

const DEV_TAMPERMONKEY_PATH = '/@tampermonkey-dev.user.js'
const cyanColor = '\u001B[36m%s\u001B[0m'

export function tampermonkeyPlugin(options: TMPluginOptions = {}): Plugin {
  const { entry, externalGlobals, autoGrant } = options
  const { transform, writeBundle } = injectMetaAndCss(externalGlobals)
  const { moduleParsed } = parseGrant(autoGrant)
  return {
    name: 'tm-userscript-builder',
    moduleParsed,
    transform,
    writeBundle,
    configureServer(server) {
      return () => {
        server.httpServer?.on('listening', () => {
          const address = getAddress(server.httpServer?.address())
          if (address) {
            setTimeout(() => {
              console.log(cyanColor, `> [Tampermonkey] - click link to install: http://${address.address}:${address.port}${DEV_TAMPERMONKEY_PATH}`)
            })
          }
        })
        server.middlewares.use((request, res, next) => {
          if (request.url === DEV_TAMPERMONKEY_PATH) {
            const address = getAddress(server.httpServer?.address())
            res.write(address ? generateDevelopmentCode(address, externalGlobals) : '\u5904\u7406\u5927\u5931\u8D25\u4E86\u55F7...')
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
  }
}
