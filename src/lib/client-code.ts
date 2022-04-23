import type { AddressInfo } from 'node:net'
import { grants } from 'common/constant'

export function generateClientCode({ address, port }: AddressInfo) {
  return `const url = 'http://${address}:${port}'

${grants.map(item => `unsafeWindow.${item} = ${item}`).join('\n')}

function createModuleScript(path) {
  const script = document.createElement('script')
  script.type = 'module'
  script.src = url + '/' + path
  document.body.appendChild(script)
  return script
}

createModuleScript('@vite/client')
createModuleScript('src/main.ts')
`
}
