import process from 'node:process'
import uni from '@dcloudio/vite-plugin-uni'
import fs from 'fs-extra'
import path from 'pathe'
import AutoImport from 'unplugin-auto-import/vite'
import { defineConfig } from 'vite'
import { UnifiedViteWeappTailwindcssPlugin } from 'weapp-tailwindcss/vite'
import { WeappTailwindcssDisabled } from './platform'
import postcssPlugins from './postcss.config'

const cwd = process.cwd()
// https://vitejs.dev/config/
export default defineConfig({
  // uvtw 一定要放在 uni 后面
  plugins: [
    uni(),
    UnifiedViteWeappTailwindcssPlugin({
      rem2rpx: true,
      disabled: WeappTailwindcssDisabled,
    }),
    AutoImport({
      imports: ['vue', 'uni-app', 'pinia'],
      dts: './src/auto-imports.d.ts',
      eslintrc: {
        enabled: true,
      },
    }),
    {
      name: 'xx',
      enforce: 'post',
      async buildEnd() {
        const modules = [...this.getModuleIds()].map((x) => {
          return this.getModuleInfo(x)
        })
        await Promise.all(modules.map(async (x) => {
          if (x) {
            const target = path.resolve(cwd, 'build', path.relative(cwd, x.id.replace('\0', '.').replaceAll(':', '/')))
            return fs.outputFile(target, x.code ?? '', 'utf8')
          }
        }))
      },
      async renderChunk(code, chunk, options, meta) {
        const target = path.resolve(cwd, 'output', path.relative(cwd, chunk.fileName.replace('\0', '.').replaceAll(':', '/')))
        await fs.outputFile(target, code ?? '', 'utf8')
      },
      //   const cwd = process.cwd()
      //   const modules = [...this.getModuleIds()].map((x) => {
      //     return this.getModuleInfo(x)
      //   })
      //   await Promise.all(modules.map(async (x) => {
      //     if (x) {
      //       const target = path.resolve(cwd, 'build', path.relative(cwd, x.id.replace('\0', '.').replaceAll(':', '/')))
      //       return fs.outputFile(target, x.code ?? '', 'utf8')
      //     }
      //   }))
      // },
    },
  ],
  // 内联 postcss 注册 tailwindcss
  css: {
    postcss: {
      plugins: postcssPlugins,
    },
    // https://vitejs.dev/config/shared-options.html#css-preprocessoroptions
    preprocessorOptions: {
      scss: {
        silenceDeprecations: ['legacy-js-api'],
      },
    },
  },
})
