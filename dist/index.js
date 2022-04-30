var __create = Object.create;
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target, mod));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  default: () => tampermonkeyPlugin,
  defineTmHeader: () => defineTmHeader
});
module.exports = __toCommonJS(src_exports);

// src/common/constant.ts
var DEV_MODE = "development";
var PROD_MODE = "production";
var GM_ADD_STYLE = "GM_addStyle";
var DEFAULT_NPM_CDN = "https://cdn.jsdelivr.net/npm";
var INTRO_FOR_PLACEHOLDER = 'console.warn("__TEMPLATE_INJECT_CSS_PLACEHOLDER_NOT_WORK__")';
var grants = [
  "unsafeWindow",
  "GM_addStyle",
  "GM_addElement",
  "GM_deleteValue",
  "GM_listValues",
  "GM_addValueChangeListener",
  "GM_removeValueChangeListener",
  "GM_setValue",
  "GM_getValue",
  "GM_log",
  "GM_getResourceText",
  "GM_getResourceURL",
  "GM_registerMenuCommand",
  "GM_unregisterMenuCommand",
  "GM_openInTab",
  "GM_xmlhttpRequest",
  "GM_download",
  "GM_getTab",
  "GM_saveTab",
  "GM_getTabs",
  "GM_notification",
  "GM_setClipboard",
  "GM_info"
];
var tmHeaderKeys = [
  "name",
  "version",
  "description",
  "author",
  "namespace",
  "license",
  "include",
  "require",
  "homepage",
  "homepageURL",
  "website",
  "source",
  "icon",
  "iconURL",
  "defaulticon",
  "icon64",
  "icon64URL",
  "updateURL",
  "downloadURL",
  "supportURL",
  "match",
  "exclude",
  "resource",
  "connect",
  "run-at",
  "grant",
  "noframes",
  "unwrap",
  "nocompat"
];

// src/lib/client-code.ts
function generateClientCode({ address, port }) {
  return `const url = 'http://${address}:${port}'

${grants.map((item) => `unsafeWindow.${item} = ${item}`).join("\n")}

function createModuleScript(path) {
  const script = document.createElement('script')
  script.type = 'module'
  script.src = url + '/' + path
  document.body.appendChild(script)
  return script
}

createModuleScript('@vite/client')
createModuleScript('src/main.ts')
`;
}

// src/common/utils.ts
var import_node_fs = __toESM(require("fs"));
var import_node_path = __toESM(require("path"));
var root = process.cwd();
function readJSON(filePath) {
  const json = import_node_fs.default.readFileSync(filePath, "utf8");
  return JSON.parse(json);
}
function readPackageJSON() {
  const packagePath = import_node_path.default.resolve(root, "package.json");
  return readJSON(packagePath);
}
function buildName(name) {
  return name.replace(/(^|-)([A-Za-z])/g, (m) => m.replace("-", "").toUpperCase());
}
function buildGlobalName(input) {
  if (!input)
    return input;
  if (Array.isArray(input)) {
    const result = {};
    for (const name of input) {
      result[name] = buildName(name);
    }
    return result;
  }
  const globals = {};
  for (const [key, value] of Object.entries(input)) {
    if (Array.isArray(value)) {
      globals[key] = value[0];
    } else {
      globals[key] = value;
    }
  }
  return globals;
}
function buildDefaultCDN(packageName) {
  const packagePath = import_node_path.default.resolve(root, `node_modules/${packageName}/package.json`);
  if (import_node_fs.default.existsSync(packagePath)) {
    const { version = "latest" } = readJSON(packagePath);
    return `${DEFAULT_NPM_CDN}/${packageName}@${version}`;
  }
  return `${DEFAULT_NPM_CDN}/${packageName}`;
}
function buildRequireCDN(input) {
  if (!input)
    return [];
  if (Array.isArray(input)) {
    return input.map((name) => buildDefaultCDN(name)).filter(Boolean);
  }
  const requireCDNs = [];
  for (const [key, value] of Object.entries(input)) {
    if (Array.isArray(value)) {
      value[1] && requireCDNs.push(value[1]);
      continue;
    }
    requireCDNs.push(buildDefaultCDN(key));
  }
  return requireCDNs;
}
function defaultEntry() {
  const tsconfigFile = import_node_path.default.resolve(root, "vite.config.ts");
  const extension = import_node_fs.default.existsSync(tsconfigFile) ? "ts" : "js";
  return import_node_path.default.resolve(root, `src/main.${extension}`);
}
function getDefinedConfig() {
  const jsonPath = import_node_path.default.resolve(root, "header.config.json");
  if (import_node_fs.default.existsSync(jsonPath)) {
    return readJSON(jsonPath);
  }
  const jsPath = import_node_path.default.resolve(root, "header.config.js");
  if (import_node_fs.default.existsSync(jsPath)) {
    return require(jsPath);
  }
  const txtPath = import_node_path.default.resolve(root, "header.config.txt");
  if (import_node_fs.default.existsSync(txtPath)) {
    return import_node_fs.default.readFileSync(txtPath, "utf8");
  }
  return readPackageJSON().tmHeader;
}
function readBundleFile(directory, fileName) {
  const distribution = directory || import_node_path.default.resolve(root, "dist");
  const filePath = import_node_path.default.resolve(distribution, fileName);
  return import_node_fs.default.readFileSync(filePath, "utf8");
}
function writeBundleFile(directory, fileName, data) {
  const distribution = directory || import_node_path.default.resolve(root, "dist");
  const filePath = import_node_path.default.resolve(distribution, fileName);
  import_node_fs.default.writeFileSync(filePath, data);
}

// src/lib/grants.ts
var import_acorn_walk = require("acorn-walk");
var grantMap = {};
for (const grant of grants) {
  grantMap[grant] = true;
}
var usedGrants = /* @__PURE__ */ new Set();
function parseGrant(autoGrant) {
  if (autoGrant === false)
    return {};
  return {
    name: "tampermonkey-grant",
    moduleParsed(moduleInfo) {
      if (/\.(ts|js|vue)$/.test(moduleInfo.id) && moduleInfo.ast) {
        (0, import_acorn_walk.full)(moduleInfo.ast, (node) => {
          if (node.type === "CallExpression") {
            const calleeName = node.callee.name;
            if (calleeName && grantMap[calleeName]) {
              usedGrants.add(calleeName);
            }
          }
          if (node.type === "Identifier" && grantMap[node.name]) {
            usedGrants.add(node.name);
          }
        });
      }
    }
  };
}
function addUsedGrants(tmConfig, isDevelopment = false) {
  if (isDevelopment) {
    tmConfig.grant = grants;
    return;
  }
  if (!Array.isArray(tmConfig.grant)) {
    tmConfig.grant = [tmConfig.grant].filter(Boolean);
  }
  tmConfig.grant = [.../* @__PURE__ */ new Set([...tmConfig.grant, ...usedGrants])];
}
function addExtraTmGrant(tmConfig) {
  if (!Array.isArray(tmConfig.grant)) {
    tmConfig.grant = [tmConfig.grant].filter(Boolean);
  }
  if (!tmConfig.grant.includes(GM_ADD_STYLE)) {
    tmConfig.grant.push(GM_ADD_STYLE);
  }
  return tmConfig;
}

// src/lib/tm-header.ts
function generateTmHeader(mode, input, hasCss) {
  var _a, _b, _c;
  const definedConfig = (_a = getDefinedConfig()) != null ? _a : {};
  if (typeof definedConfig == "string")
    return definedConfig;
  const packageJson = readPackageJSON();
  const config = {};
  for (const key of tmHeaderKeys) {
    const value = (_b = definedConfig[key]) != null ? _b : packageJson[key];
    if (value)
      config[key] = value;
  }
  config.require = [...(_c = config.require) != null ? _c : [], ...buildRequireCDN(input)];
  if (mode === DEV_MODE) {
    addUsedGrants(config, true);
    config.name += "-vite-dev";
  } else {
    hasCss && addExtraTmGrant(config);
    addUsedGrants(config);
  }
  const definedMetaKeys = Object.keys(config);
  const maxKeyLength = Math.max(...definedMetaKeys.map((k) => k.length));
  const definedMetaBlock = definedMetaKeys.flatMap((key) => {
    const value = config[key];
    const spaces = Array.from({ length: maxKeyLength - key.length + 8 }).join(" ");
    const dealMeta = (v) => {
      if (Array.isArray(v))
        return v.map((element) => dealMeta(element));
      if (typeof v == "boolean" && v === true)
        return `// @${key}`;
      return `// @${key}${spaces}${v}`;
    };
    return dealMeta(value);
  });
  return [
    "// ==UserScript==",
    ...definedMetaBlock,
    "// ==/UserScript=="
  ].join("\n");
}

// src/lib/build-options.ts
var getRollupOptions = (input) => {
  const external = Array.isArray(input) ? input : Object.keys(input != null ? input : {});
  const globals = buildGlobalName(input);
  return {
    external,
    output: {
      globals,
      intro: INTRO_FOR_PLACEHOLDER,
      inlineDynamicImports: true
    }
  };
};
var getLibraryOptions = (entry) => {
  const { name: packageName } = readPackageJSON();
  if (!packageName) {
    const error = "props `name` in package.json is required!";
    console.error(error);
    throw new Error(error);
  }
  const name = buildName(packageName);
  return {
    name,
    entry: entry != null ? entry : defaultEntry(),
    formats: ["iife"],
    fileName: () => `${packageName}.user.js`
  };
};

// src/lib/inject.ts
function injectMetaAndCss(input) {
  if (process.env.NODE_ENV != PROD_MODE)
    return {};
  const allCss = [];
  return {
    name: "inject-meta-css",
    transform(code, id) {
      if (/\.(c|le|sc)ss$/.test(id)) {
        allCss.push(code);
        return { code: "" };
      }
    },
    writeBundle({ dir }, bundle) {
      for (const [fileName, bundleValue] of Object.entries(bundle)) {
        let result = readBundleFile(dir, fileName);
        const hasCss = allCss.length > 0;
        result = result.replace(INTRO_FOR_PLACEHOLDER, hasCss ? `${GM_ADD_STYLE}(${["`", ...allCss, "`"].join("\n")})` : "");
        if (bundleValue.type === "chunk") {
          for (const [moduleKey, moduleValue] of Object.entries(bundleValue.modules)) {
            if (/\.(c|le|sc)ss$/.test(moduleKey) && moduleValue.code) {
              const csscode = moduleValue.code.replaceAll("'", '"');
              result = result.replace(csscode, "");
            }
          }
        }
        result = generateTmHeader(PROD_MODE, input, hasCss) + "\n\n" + result;
        writeBundleFile(dir, fileName, result);
      }
    }
  };
}

// src/lib/plugin.ts
function generateDevelopmentCode(address, input) {
  const tmHeader = generateTmHeader(DEV_MODE, input, true);
  return `${tmHeader}
  (function () {
    ${generateClientCode(address)}
  })()`;
}
function getAddress(address) {
  return typeof address == "object" ? address : void 0;
}
var DEV_TAMPERMONKEY_PATH = "/@tampermonkey-dev.user.js";
var cyanColor = "\x1B[36m%s\x1B[0m";
function tampermonkeyPlugin(options = {}) {
  const { entry, externalGlobals, autoGrant } = options;
  const { transform, writeBundle } = injectMetaAndCss(externalGlobals);
  const { moduleParsed } = parseGrant(autoGrant);
  return {
    name: "tm-userscript-builder",
    moduleParsed,
    transform,
    writeBundle,
    configureServer(server) {
      return () => {
        var _a;
        (_a = server.httpServer) == null ? void 0 : _a.on("listening", () => {
          var _a2;
          const address = getAddress((_a2 = server.httpServer) == null ? void 0 : _a2.address());
          if (address) {
            setTimeout(() => {
              console.log(cyanColor, `> [Tampermonkey] - click link to install: http://${address.address}:${address.port}${DEV_TAMPERMONKEY_PATH}`);
            });
          }
        });
        server.middlewares.use((request, res, next) => {
          var _a2;
          if (request.url === DEV_TAMPERMONKEY_PATH) {
            const address = getAddress((_a2 = server.httpServer) == null ? void 0 : _a2.address());
            res.write(address ? generateDevelopmentCode(address, externalGlobals) : "\u5904\u7406\u5927\u5931\u8D25\u4E86\u55F7...");
          }
          next();
        });
      };
    },
    config(config) {
      var _a;
      let hmr = (_a = config.server) == null ? void 0 : _a.hmr;
      if (typeof hmr === "boolean" || !hmr)
        hmr = {};
      hmr.protocol = "ws";
      hmr.host = "127.0.0.1";
      config.server = __spreadProps(__spreadValues({}, config.server), {
        hmr
      });
      config.build = {
        lib: getLibraryOptions(entry),
        rollupOptions: getRollupOptions(externalGlobals),
        minify: false,
        sourcemap: false,
        cssCodeSplit: false
      };
    }
  };
}

// src/index.ts
function defineTmHeader(options) {
  return options;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  defineTmHeader
});
