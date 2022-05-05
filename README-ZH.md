# vite-plugin-tm-userscript

中文 | [English](https://github.com/asadahimeka/vite-plugin-tm-userscript/blob/master/README.md)

> 修改自 [vite-plugin-tampermonkey](https://www.npmjs.com/package/vite-plugin-tampermonkey)

基于 `vite` 的 Tampermonkey 用户脚本开发构建插件。

## 特点

- 通过单独的配置文件或者 `package.json` 中的 `tmHeader` 字段来配置 Tampermonkey 的 Userscript Header
- 构建生产时支持自动分析代码用到的 `grant`
- 开发模式时默认导入所有 `grant`，并且把所有的 `grant` 方法加入到 `unsafeWindow`
- 可通过简单配置，把引入的外部包 `require` 化，自动引入 UNPKG CDN，详情见下面的插件配置

> 鉴于最近的网络环境，jsDelivr 与 UNPKG 相对来说都比较慢，建议自行配置可用的 CDN，配置方式见下文 `externalGlobals`

<blockquote>
常用前端 CDN 加速服务：

https://www.bootcdn.cn

https://cdn.baomitu.com

https://staticfile.org

http://cdn.bytedance.com
</blockquote>

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
import TMPlugin from 'vite-plugin-tm-userscript'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    TMPlugin({
      externalGlobals: ['vue']
    })
  ]
})
```

### 配置 Userscript Header

有四种方式来配置 `Userscript Header`, 优先级如下所示

1. `header.config.json`
2. `header.config.js`
3. `header.config.txt`
4. `package.json` 中的 `tmHeader` 字段

其中 `header.config.txt` 使用 Tampermonkey 头部注释配置，不会经过处理，直接插入脚本头部作为 Header 使用

其他三种格式按 json 格式配置，多个属性配置如 `match` 用数组表示，经过处理自动添加 `grant` 与 `require`

示例配置见 [`example/header.config.js`](https://github.com/asadahimeka/vite-plugin-tm-userscript/blob/master/example/header.config.js)

具体属性配置见 [Tampermonkey 文档](https://www.tampermonkey.net/documentation.php)

## 插件配置

```ts
export interface TMPluginOptions {
  entry?: string;
  autoGrant?: boolean;
  externalGlobals?: string[] | Record<string, string | string[]>;
}
```

### `externalGlobals`

配置外部包，比如 `vue`，`axios` 等，减少打包体积，并且会自动声明 `require` ，如下配置：

三种配置形式，可自定义 CDN，不配置 CDN 的话默认使用 UNPKG CDN

```js
// 1
TMPlugin({
  externalGlobals: ['jquery']
})

// 2
TMPlugin({
  externalGlobals: {
    'jquery': 'jQuery'
  }
})

// 3
TMPlugin({
  externalGlobals: {
    'jquery': ['jQuery', 'https://cdn.bootcdn.net/ajax/libs/jquery/3.6.0/jquery.min.js']
  }
})

// =>

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

见 `example` 文件夹

## vite 配置额外说明

生产构建模式将强制配置 `config.build`:

- 构建的包名为 `package.json` 的 `name` （**必须填写**）属性的驼峰模式，构建的文件名也与其相关
- 文件打包格式为 `iife`，不压缩，不分离 `css` 文件
- 额外配置了 `rollupOptions`，以支持其他功能

## 禁止 CSP(Content-Security-Policy)

在开发模式下，需要通过 `script` 标签注入 `vite` 的脚本，有些网站开启了 `CSP(Content-Security-Policy)`，导致报错，可以安装 `Chrome` 插件 [Disable Content-Security-Policy](https://chrome.google.com/webstore/detail/disable-content-security/ieelmcmcagommplceebfedjlakkhpden) 或者 [Always Disable Content-Security-Policy](https://chrome.google.com/webstore/detail/always-disable-content-se/ffelghdomoehpceihalcnbmnodohkibj)，来禁止 `CSP(Content-Security-Policy)`，**在开发时开启插件即可（其他时间记得关闭以保证网页浏览的安全性）**。
