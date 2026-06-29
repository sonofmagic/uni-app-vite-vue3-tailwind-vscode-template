import uni from '@dcloudio/vite-plugin-uni'
import { defineConfig } from 'vite'
import { WeappTailwindcss } from 'weapp-tailwindcss/vite'
import { autoImportSubpackageTailwind } from './build/plugins/auto-import-subpackage-tailwind'

// https://vitejs.dev/config/
export default defineConfig(async () => {
  // 新版本的 unplugin-auto-import 改成了只有 esm 格式的产物，而 uni-app 目前必须 cjs 格式
  // 所以需要改成动态 import 的写法来进行引入
  // 详见 https://github.com/sonofmagic/uni-app-vite-vue3-tailwind-vscode-template/issues/29
  const { default: AutoImport } = await import('unplugin-auto-import/vite')
  return {
    // uvtw 一定要放在 uni 后面
    plugins: [
      uni(),
      WeappTailwindcss({
        cssEntries: [
          './src/tailwind.css',
          './src/package-basic/tailwind.css',
          './src/package-isolated/tailwind.css',
        ],
        rem2rpx: true,
      }),
      autoImportSubpackageTailwind(),
      AutoImport({
        imports: ['vue', 'uni-app', 'pinia'],
        dts: './src/auto-imports.d.ts',
        eslintrc: {
          enabled: true,
        },
      }),
    ],
    // 内联 postcss 注册 tailwindcss
    css: {
      // https://vitejs.dev/config/shared-options.html#css-preprocessoroptions
      preprocessorOptions: {
        scss: {
          silenceDeprecations: ['legacy-js-api'],
        },
      },
    },
  }
})
