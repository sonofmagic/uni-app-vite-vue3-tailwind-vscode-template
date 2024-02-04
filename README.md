# uni-app-vite-vue3-tailwind-vscode-template

基于 `uni-app` 的 `vite/vue3` `tailwindcss` 模板

假如你觉得好用，欢迎给我的 [`weapp-tailwindcss`](https://github.com/sonofmagic/weapp-tailwindcss) 点个 `Star` 吧。

官网地址: <https://weapp-tw.icebreaker.top/>

## 特性

- ⚡️ [Vue 3](https://github.com/vuejs/core), [Vite](https://github.com/vitejs/vite), [Yarn](https://github.com/yarnpkg/yarn) - 快且稳定

- 🎨 [TailwindCSS](https://tailwindcss.com/) - 世界上最流行，生态最好的原子化CSS框架

- 😃 [集成 Iconify](https://github.com/egoist/tailwindcss-icons) - [icones.js.org](https://icones.js.org/) 中的所有图标都为你所用

- 📥 [API 自动加载](https://github.com/antfu/unplugin-auto-import) - 直接使用 Composition API 无需引入

- 🧬 [uni-app 条件编译样式](https://weapp-tw.icebreaker.top/docs/quick-start/uni-app-css-macro) - 帮助你在多端更灵活的使用 `TailwindCSS`

- 🦾 [TypeScript](https://www.typescriptlang.org/) & [ESLint](https://eslint.org/) & [Prettier](https://github.com/prettier/prettier) - 类型，校验与格式化，保证你的代码质量

## 快速开始

使用 `vscode` 的朋友，请先安装 [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss) 智能提示与感应插件

其他 IDE 请参考: <https://weapp-tw.icebreaker.top/docs/quick-start/intelliSense>

本项目已经集成 `weapp-ide-cli` 可以通过 `cli` 对 `ide` 进行额外操作，[详细信息](https://www.npmjs.com/package/weapp-ide-cli)

## 单位转换

- `rem`->`rpx` (默认开启,  `uvtw` 的 `rem2rpx` 选项)
- `px` -> `rpx` (默认不开启，可反注释 `postcss.config.cjs` 中的 `postcss-pxtransform` 开启配置)

## Tips

- 升级 `uni-app` 依赖的方式为 `npx @dcloudio/uvm` 后，选择对应的 `Package Manager` 即可。而升级其他包的方式，可以使用 `yarn upgradeInteractive --latest`，这个是 `yarn` 自带的方式。

> 之前使用 `pnpm` 进行安装的时候，一直有 `bug` 导致控件库无法加载运行，如果发现 `pnpm` 好了可以 `issue` 里通知一声

- `vite` 使用高德地图加载 `commonjs` 模块示例见 <https://github.com/sonofmagic/uni-app-vue3-for-amap-wx>，需要使用 `@rollup/plugin-commonjs`

- 另外暂时不要升级 `pinia` 的版本，不然会报`hasInjectionContext`相关的错误 ，详见 [pinia/issues/2210](https://github.com/vuejs/pinia/issues/2210)
