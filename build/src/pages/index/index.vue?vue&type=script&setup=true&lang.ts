import { default as uni } from '/Users/icebreaker/Documents/GitHub/uni-app-vite-vue3-tailwind-vscode-template/node_modules/.pnpm/@dcloudio+uni-mp-weixin@3.0.0-4050620250312001_postcss@8.5.3_rollup@4.30.1_vue@3.4.21_typescript@5.8.2_/node_modules/@dcloudio/uni-mp-weixin/dist/uni.api.esm.js';

import { defineComponent as _defineComponent } from "vue";
import { unref as _unref, t as _t, o as _o, n as _n } from "vue";
const __BINDING_COMPONENTS__ = '{"WeappTailwindcss":{"name":"WeappTailwindcss","type":"setup"}}';
if (!Math) {
  WeappTailwindcss();
}
const WeappTailwindcss = ()=>import('uniComponent://L1VzZXJzL2ljZWJyZWFrZXIvRG9jdW1lbnRzL0dpdEh1Yi91bmktYXBwLXZpdGUtdnVlMy10YWlsd2luZC12c2NvZGUtdGVtcGxhdGUvc3JjL2NvbXBvbmVudHMvV2VhcHBUYWlsd2luZGNzcy52dWU');
import { useCounterStore } from "@/stores/counter";

import { storeToRefs } from 'pinia';
import { ref, computed, onBeforeUnmount } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
export default /* @__PURE__ */ _defineComponent({
  __name: "index",
  setup(__props) {
    const store = useCounterStore();
    const { count } = storeToRefs(store);
    const { increment } = store;
    const buttonColors = [
      "bg-[#000]",
      "bg-[#111]",
      "bg-[#222]",
      "bg-[#333]",
      "bg-[#444]",
      "bg-[#555]",
      "bg-[#666]",
      "bg-[#777]",
      "bg-[#888]",
      "bg-[#999]",
      "bg-[#aaa]",
      "bg-[#bbb]",
      "bg-[#ccc]",
      "bg-[#ddd]",
      "bg-[#eee]",
      "bg-[#fff]"
    ];
    const title = ref("Hello");
    const themeRef = ref(uni.getSystemInfoSync().theme);
    const classArray = computed(() => [
      title.value ? "bg-[#aa00aa]" : void 0,
      {
        "text-[#ffffffee]": Boolean(title)
      }
    ]);
    const buttonClass = computed(() => {
      return buttonColors[count.value % buttonColors.length];
    });
    uni.onThemeChange(({ theme }) => {
      themeRef.value = theme;
    });
    onBeforeUnmount(() => {
      uni.offThemeChange(() => {
        console.log("offThemeChange");
      });
    });
    onLoad(() => {
      console.log("欢迎使用 weapp-tailwindcss 模板");
    });
    function copy(data) {
      uni.setClipboardData({
        data
      });
    }
    return (_ctx, _cache) => {
      return {
        a: _t(_unref(count)),
        b: _n(_unref(buttonClass)),
        c: _o(
          //@ts-ignore
          (...args) => _unref(increment) && _unref(increment)(...args)
        ),
        d: _o(($event) => copy("https://weapp-tw.icebreaker.top/docs/icons")),
        e: _n(_unref(classArray)),
        f: _n(_unref(classArray)),
        g: _n(_unref(classArray)),
        h: _n(_unref(classArray)),
        i: _n(_unref(classArray)),
        j: _o(($event) => copy("https://weapp-tw.icebreaker.top/docs/quick-start/uni-app-css-macro"))
      };
    };
  }
});
