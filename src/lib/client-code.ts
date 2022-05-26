import type { AddressInfo } from 'node:net'
import { grants } from 'common/constant'

export function generateClientCode({ address, port }: AddressInfo, entry?: string) {
  return `
  const url = 'http://${address}:${port}'

  const originFetch = unsafeWindow.fetch
  const ping = '/__vite_ping'
  unsafeWindow.fetch = function(input, init) {
    if (input === ping) {
      input = url + ping
    }
    return originFetch(input, init)
  }

  ${grants.map(item => `unsafeWindow.${item} = ${item}`).join('\n  ')}

  function createModuleScript(path) {
    if (typeof GM_addElement == 'function') {
      return GM_addElement('script', {
        type: 'module',
        src: url + '/' + path
      })
    } else {
      const script = document.createElement('script')
      script.type = 'module'
      script.src = url + '/' + path
      document.body.appendChild(script)
      return script
    }
  }

  createModuleScript('@vite/client')
  createModuleScript('${entry ?? 'src/main.ts'}')
`
}
