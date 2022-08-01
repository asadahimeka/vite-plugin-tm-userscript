import type { Merge, Writeable } from 'common/type'

export const DEV_MODE = 'development'
export const PROD_MODE = 'production'
export const GM_ADD_STYLE = 'GM_addStyle'
export const DEFAULT_NPM_CDN = 'https://unpkg.com'
export const INTRO_FOR_PLACEHOLDER = 'console.warn("__TEMPLATE_INJECT_CSS_PLACEHOLDER_NOT_WORK__")'

export const grants = [
  'unsafeWindow',
  'GM_addStyle',
  'GM_addElement',
  'GM_deleteValue',
  'GM_listValues',
  'GM_addValueChangeListener',
  'GM_removeValueChangeListener',
  'GM_setValue',
  'GM_getValue',
  'GM_log',
  'GM_getResourceText',
  'GM_getResourceURL',
  'GM_registerMenuCommand',
  'GM_unregisterMenuCommand',
  'GM_openInTab',
  'GM_xmlhttpRequest',
  'GM_download',
  'GM_getTab',
  'GM_saveTab',
  'GM_getTabs',
  'GM_notification',
  'GM_setClipboard',
  'GM_info'
] as const

export type Grant = typeof grants[number]
export type Grants = Writeable<typeof grants>

export const tmHeaderKeys = [
  'name',
  'name:en',
  'name:zh',
  'name:zh-cn',
  'version',
  'description',
  'description:en',
  'description:zh',
  'description:zh-cn',
  'author',
  'namespace',
  'license',
  'match',
  'include',
  'require',
  'homepage',
  'homepageURL',
  'website',
  'source',
  'icon',
  'iconURL',
  'defaulticon',
  'icon64',
  'icon64URL',
  'updateURL',
  'downloadURL',
  'supportURL',
  'contributionURL',
  'contributionAmount',
  'compatible',
  'incompatible',
  'exclude',
  'resource',
  'connect',
  'run-at',
  'grant',
  'noframes',
  'unwrap',
  'nocompat',
  'antifeature'
] as const

type RunAt = 'document-start' | 'document-body' | 'document-end' | 'document-idle' | 'context-menu'
type AntiFeature = 'ads' | 'tracking' | 'miner' | 'membership' | 'payment' | 'referral-link'

type TmHeaderKey = typeof tmHeaderKeys[number]
export type BareTmHeaderConfig = Partial<Record<TmHeaderKey, string | string[]>>
export type TmHeaderConfig = Merge<BareTmHeaderConfig, {
  noframes?: boolean;
  nocompat?: boolean;
  unwrap?: boolean;
  grant?: Grant | Grant[];
  'run-at'?: RunAt | RunAt[];
  antifeature?: AntiFeature | AntiFeature[];
}>
export type TmHeaderConfigKeys = Array<keyof TmHeaderConfig>
