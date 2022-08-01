# vite-plugin-tm-userscript

![](https://img.shields.io/github/package-json/v/asadahimeka/vite-plugin-tm-userscript)
![](https://img.shields.io/badge/license-MIT-green)
![](https://img.shields.io/github/package-json/dependency-version/asadahimeka/vite-plugin-tm-userscript/dev/tsup)
![](https://img.shields.io/github/package-json/dependency-version/asadahimeka/vite-plugin-tm-userscript/dev/typescript)

中文 | [English](https://github.com/asadahimeka/vite-plugin-tm-userscript/blob/master/README.md)

基于 `vite` 的 Tampermonkey 用户脚本开发构建插件。

修改自 [vite-plugin-tampermonkey](https://www.npmjs.com/package/vite-plugin-tampermonkey)。

## 特点

- 通过单独的配置文件或者 `package.json` 中的 `tmHeader` 字段来配置 Tampermonkey 的 Userscript Header
- 构建生产时支持自动分析代码用到的 `grant`
- 开发模式时默认导入所有 `grant`，并且把所有的 `grant` 方法加入到 `unsafeWindow`
- 可通过简单配置，把引入的外部包 `require` 化，自动引入 UNPKG CDN，详情见下面的插件配置

> 鉴于最近的网络环境，jsDelivr 与 UNPKG 相对来说都比较慢，建议自行配置可用的 CDN，配置方式见下文 `externalGlobals`

> 常用前端 CDN 加速服务：
>
> https://www.bootcdn.cn
>
> https://cdn.baomitu.com
>
> https://staticfile.org
>
> http://cdn.bytedance.com

## 使用

### 安装

```bash
yarn add vite-plugin-tm-userscript -D
# OR
npm install vite-plugin-tm-userscript -D
```

### 配置 `vite.config.ts`

```js
import { defineConfig } from 'vite'
import Userscript from 'vite-plugin-tm-userscript'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    Userscript({
      externalGlobals: ['vue']
    })
  ]
})
```

### 配置 Userscript Header

有几种方式来配置 `Userscript Header`, 优先级如下所示

1. 插件的 `headers` 选项
2. `header.config.json`
3. `header.config.js`
4. `header.config.txt`
5. `package.json` 中的 `tmHeader` 字段

其中 `header.config.txt` 使用 Tampermonkey 头部注释配置，不会经过处理，直接插入脚本头部作为 Header 使用

其他几种格式按 json 格式配置，多个属性配置如 `match` 用数组表示，经过处理自动添加 `grant` 与 `require`

示例配置见 [`example/header.config.js`](https://github.com/asadahimeka/vite-plugin-tm-userscript/blob/master/example/header.config.js)

具体属性配置见 [Tampermonkey 文档](https://www.tampermonkey.net/documentation.php)

## 插件配置

```ts
export interface TMPluginOptions {
  entry?: string;
  autoGrant?: boolean;
  headers?: TmHeaderConfig;
  externalGlobals?: string[] | Record<string, string | string[]>;
}
```

### `externalGlobals`

配置外部包，比如 `vue`，`axios` 等，减少打包体积，并且会自动声明 `require` ，如下配置：

三种配置形式，可自定义 CDN，不配置 CDN 的话默认使用 UNPKG CDN

```js
// 1
Userscript({
  externalGlobals: ['jquery']
})

// 2
Userscript({
  externalGlobals: {
    'jquery': 'jQuery'
  }
})

// 3
Userscript({
  externalGlobals: {
    'jquery': ['jQuery', 'https://cdn.bootcdn.net/ajax/libs/jquery/3.6.0/jquery.min.js']
  }
})

// 转化为 =>

return {
  rollupOptions: {
    external: ['jquery']
    output: {
      globals: {
        jquery: 'jQuery'
      }
    }
  }
}

// @require https://cdn.bootcdn.net/ajax/libs/jquery/3.6.0/jquery.min.js
```

### `autoGrant`

`boolean` 类型，默认为 `true`

自动分析代码中使用的 Tampermonkey 的 `grant`，并加入 Userscript Header 声明中

### `entry`

入口文件，默认为 `src/main.js` 或者 `src/main.ts`

## 示例

见 [`example`](https://github.com/asadahimeka/vite-plugin-tm-userscript/tree/master/example) 文件夹

## 说明

### vite 配置额外说明

生产构建模式将强制配置 `config.build`:

- 构建的包名为 `package.json` 的 `name` （**必须填写**）属性的驼峰模式，构建的文件名也与其相关
- 文件打包格式为 `iife`，不压缩，不分离 `css` 文件
- 额外配置了 `rollupOptions`，以支持其他功能

### 禁止 CSP(Content-Security-Policy)

在开发模式下，需要通过 `script` 标签注入 `vite` 的脚本，有些网站开启了 `CSP(Content-Security-Policy)`，导致报错，可以安装 `Chrome` 插件 [Disable Content-Security-Policy](https://chrome.google.com/webstore/detail/disable-content-security/ieelmcmcagommplceebfedjlakkhpden) 或者 [Always Disable Content-Security-Policy](https://chrome.google.com/webstore/detail/always-disable-content-se/ffelghdomoehpceihalcnbmnodohkibj)，来禁止 `CSP(Content-Security-Policy)`，**在开发时开启插件即可（其他时间记得关闭以保证网页浏览的安全性）**。

也可以打开 Tampermonkey 设置 `extension://iikmkjmpaadaobahmlepeloendndfphd/options.html#nav=settings`，在 `安全` 项下把 `如果站点有内容安全策略（CSP）则向其策略:` 改为 `全部移除（可能不安全）`。

![image](https://user-images.githubusercontent.com/31837214/177236988-56a9cb86-a8d7-4320-9f47-b10be9e64582.png)


## 替代项目

[gorilla](https://github.com/apsking/gorilla)

[vite-plugin-tampermonkey](https://github.com/Thinker-ljn/vite-plugin-tampermonkey)

[vite-plugin-monkey](https://github.com/lisonge/vite-plugin-monkey)
