import { defineConfig } from "vite";
import uni from "@dcloudio/vite-plugin-uni";
const isH5 = process.env.UNI_PLATFORM === "h5";
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
