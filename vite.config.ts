import { defineConfig } from "vite";
import uni from "@dcloudio/vite-plugin-uni";
const isH5 = process.env.UNI_PLATFORM === "h5";
// 假如要加载一些 commonjs 模块，需要引入这个插件，很多地图的sdk都是 commonjs，假如引用报错需要引入它并添加到 `plugins` 里
// import commonjs from "@rollup/plugin-commonjs";
import {
  ViteWeappTailwindcssPlugin as vwt,
  postcssWeappTailwindcssRename,
} from "weapp-tailwindcss-webpack-plugin";

const postcssPlugins = [require("autoprefixer")(), require("tailwindcss")()];
if (!isH5) {
  postcssPlugins.push(
    require("postcss-rem-to-responsive-pixel")({
      rootValue: 32,
      propList: ["*"],
      transformUnit: "rpx",
    })
  );
  postcssPlugins.push(postcssWeappTailwindcssRename());
}
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [uni(), isH5 ? undefined : vwt()],
  // 假如 postcss.config.js 不起作用，请使用内联 postcss
  css: {
    postcss: {
      plugins: postcssPlugins,
    },
  },
});
