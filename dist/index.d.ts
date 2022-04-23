import { Plugin } from 'vite';

declare type Merge<M, N> = Omit<M, Extract<keyof M, keyof N>> & N;

declare const grants: readonly ["unsafeWindow", "GM_addStyle", "GM_addElement", "GM_deleteValue", "GM_listValues", "GM_addValueChangeListener", "GM_removeValueChangeListener", "GM_setValue", "GM_getValue", "GM_log", "GM_getResourceText", "GM_getResourceURL", "GM_registerMenuCommand", "GM_unregisterMenuCommand", "GM_openInTab", "GM_xmlhttpRequest", "GM_download", "GM_getTab", "GM_saveTab", "GM_getTabs", "GM_notification", "GM_setClipboard", "GM_info"];
declare type Grant = typeof grants[number];
declare const tmHeaderKeys: readonly ["name", "version", "description", "author", "namespace", "license", "include", "require", "homepage", "homepageURL", "website", "source", "icon", "iconURL", "defaulticon", "icon64", "icon64URL", "updateURL", "downloadURL", "supportURL", "match", "exclude", "resource", "connect", "run-at", "grant", "noframes", "unwrap", "nocompat"];
declare type RunAt = 'document-start' | 'document-body' | 'document-end' | 'document-idle' | 'context-menu';
declare type TmHeaderKey = typeof tmHeaderKeys[number];
declare type BareTmHeaderConfig = Partial<Record<TmHeaderKey, string | string[]>>;
declare type TmHeaderConfig = Merge<BareTmHeaderConfig, {
    noframes?: boolean;
    nocompat?: boolean;
    unwrap?: boolean;
    grant?: Grant | Grant[];
    'run-at'?: RunAt | RunAt[];
}>;

interface TMPluginOptions {
    entry?: string;
    autoGrant?: boolean;
    externalGlobals?: string[] | Record<string, string | string[]>;
}
declare function tampermonkeyPlugin(options?: TMPluginOptions): Plugin;

declare function defineTmHeader(options: TmHeaderConfig): TmHeaderConfig;

export { tampermonkeyPlugin as default, defineTmHeader };
