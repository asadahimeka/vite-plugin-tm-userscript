import { INTRO_FOR_PLACEHOLDER } from 'common/constant'
import { buildGlobalName, buildName, defaultEntry, readPackageJSON } from 'common/utils'
import type { BuildOptions } from 'vite'
import type { TMPluginOptions, TMExternalGlobals } from './plugin'

type GetRollupOption = (input: TMExternalGlobals) => BuildOptions['rollupOptions']
type GetLibraryOption = (entry: TMPluginOptions['entry']) => BuildOptions['lib']

export const getRollupOptions: GetRollupOption = input => {
  const external = Array.isArray(input) ? input : Object.keys(input ?? {})
  const globals = buildGlobalName(input)
  return {
    external,
    output: {
      globals,
      intro: INTRO_FOR_PLACEHOLDER,
      inlineDynamicImports: true
    }
  }
}

export const getLibraryOptions: GetLibraryOption = entry => {
  const { name: packageName } = readPackageJSON()
  if (!packageName) {
    const error = 'props `name` in package.json is required!'
    console.error(error)
    throw new Error(error)
  }
  const name = buildName(packageName)
  return {
    name,
    entry: entry ?? defaultEntry(),
    formats: ['iife'],
    fileName: () => `${packageName}.user.js`
  }
}
