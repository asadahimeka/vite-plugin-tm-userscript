import fs from 'node:fs'
import path from 'node:path'
import { DEFAULT_NPM_CDN } from './constant'
import type { TMExternalGlobals } from 'lib/plugin'

const root = process.cwd()

export function readJSON(filePath: string) {
  const json = fs.readFileSync(filePath, 'utf8')
  return JSON.parse(json)
}

export function readPackageJSON() {
  const packagePath = path.resolve(root, 'package.json')
  return readJSON(packagePath)
}

export function buildName(name: string) {
  return name.replace(/(^|-)([A-Za-z])/g, m => m.replace('-', '').toUpperCase())
}

export function buildGlobalName(input: TMExternalGlobals) {
  if (!input) return input
  if (Array.isArray(input)) {
    const result: Record<string, string> = {}
    for (const name of input) {
      result[name] = buildName(name)
    }
    return result
  }
  const globals: Record<string, string> = {}
  for (const [key, value] of Object.entries(input)) {
    if (Array.isArray(value)) {
      globals[key] = value[0]
    } else {
      globals[key] = value
    }
  }
  return globals
}

function buildDefaultCDN(packageName: string) {
  const packagePath = path.resolve(root, `node_modules/${packageName}/package.json`)
  if (fs.existsSync(packagePath)) {
    const { version = 'latest' } = readJSON(packagePath)
    return `${DEFAULT_NPM_CDN}/${packageName}@${version}`
  }
  return `${DEFAULT_NPM_CDN}/${packageName}`
}

export function buildRequireCDN(input: TMExternalGlobals) {
  if (!input) return []
  if (Array.isArray(input)) {
    return input.map(name => buildDefaultCDN(name)).filter(Boolean)
  }
  const requireCDNs: string[] = []
  for (const [key, value] of Object.entries(input)) {
    if (Array.isArray(value)) {
      value[1] && requireCDNs.push(value[1])
      continue
    }
    requireCDNs.push(buildDefaultCDN(key))
  }
  return requireCDNs
}

export function defaultEntry() {
  const tsconfigFile = path.resolve(root, 'vite.config.ts')
  const extension = fs.existsSync(tsconfigFile) ? 'ts' : 'js'
  return path.resolve(root, `src/main.${extension}`)
}

export function getDefinedConfig() {
  const jsonPath = path.resolve(root, 'header.config.json')
  if (fs.existsSync(jsonPath)) {
    return readJSON(jsonPath)
  }
  const jsPath = path.resolve(root, 'header.config.js')
  if (fs.existsSync(jsPath)) {
    // eslint-disable-next-line unicorn/prefer-module
    return require(jsPath)
  }
  const txtPath = path.resolve(root, 'header.config.txt')
  if (fs.existsSync(txtPath)) {
    return fs.readFileSync(txtPath, 'utf8')
  }
  return readPackageJSON().tmHeader
}

export function readBundleFile(directory: string | undefined, fileName: string) {
  const distribution = directory || path.resolve(root, 'dist')
  const filePath = path.resolve(distribution, fileName)
  return fs.readFileSync(filePath, 'utf8')
}

export function writeBundleFile(directory: string | undefined, fileName: string, data: string) {
  const distribution = directory || path.resolve(root, 'dist')
  const filePath = path.resolve(distribution, fileName)
  fs.writeFileSync(filePath, data)
}
