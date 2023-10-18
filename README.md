# uni-app-vite-vue3-tailwind-vscode-template

基于 uni-app 的 vite/vue3 tailwindcss 模板

> `postcss.config.js` 假如不起作用，请使用 `内联postcss`

假如你觉得好用，欢迎给我的 [`weapp-tailwindcss`](https://github.com/sonofmagic/weapp-tailwindcss) 点个 `Star` 吧。

## 快速开始

本项目已经集成 `weapp-ide-cli` 可以通过 `cli` 对 `ide` 进行额外操作，[详细信息](https://www.npmjs.com/package/weapp-ide-cli)

## 单位转换

- `rem`->`rpx` (默认开启)
- `px` -> `rpx` (默认不开启，可反注释开启配置)

注册以及配置项都在 `postcss.config.cjs` 中，可以灵活配置

## Tips

- 升级 `uni-app` 依赖的方式为 `npx @dcloudio/uvm` 后，选择对应的 `Package Manager` 即可。而升级其他包的方式，可以使用 `yarn upgradeInteractive --latest`，这个是 `yarn` 自带的方式。

> 之前使用 `pnpm` 进行安装的时候，一直有 `bug` 导致控件库无法加载运行，如果发现 `pnpm` 好了可以 `issue` 里通知一声

- `vite` 使用高德地图加载 `commonjs` 模块示例见 <https://github.com/sonofmagic/uni-app-vue3-for-amap-wx>，需要使用 `@rollup/plugin-commonjs`

- 另外暂时不要升级 `pinia` 的版本，不然会报`hasInjectionContext`相关的错误 ，详见 [pinia/issues/2210](https://github.com/vuejs/pinia/issues/2210)
