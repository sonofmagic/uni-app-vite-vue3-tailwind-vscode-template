import { default as uni } from '/Users/icebreaker/Documents/GitHub/uni-app-vite-vue3-tailwind-vscode-template/node_modules/.pnpm/@dcloudio+uni-mp-weixin@3.0.0-4050620250312001_postcss@8.5.3_rollup@4.30.1_vue@3.4.21_typescript@5.8.2_/node_modules/@dcloudio/uni-mp-weixin/dist/uni.api.esm.js';

import { o as _o } from "vue"


const _sfc_main = {
  __name: 'WeappTailwindcss',
  setup(__props) {

function copy(data) {
  uni.setClipboardData({
    data,
  })
}

return (_ctx, _cache) => {
  return {
  a: _o($event => copy('https://github.com/sonofmagic/weapp-tailwindcss')),
  b: _o($event => copy('https://tw.icebreaker.top/'))
}
}
}

}



export default _sfc_main