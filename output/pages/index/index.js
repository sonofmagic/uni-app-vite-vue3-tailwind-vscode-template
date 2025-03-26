'use strict';

const common_vendor = require('../../common/vendor.js');
const stores_counter = require('../../stores/counter.js');

if (!Math) {
  WeappTailwindcss();
}
const WeappTailwindcss = ()=>('../../components/WeappTailwindcss.js');
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "index",
  setup(__props) {
    const store = stores_counter.useCounterStore();
    const { count } = common_vendor.storeToRefs(store);
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
    const title = common_vendor.ref("Hello");
    const themeRef = common_vendor.ref(common_vendor.index.getSystemInfoSync().theme);
    const classArray = common_vendor.computed(() => [
      title.value ? "bg-[#aa00aa]" : undefined,
      {
        "text-[#ffffffee]": Boolean(title)
      }
    ]);
    const buttonClass = common_vendor.computed(() => {
      return buttonColors[count.value % buttonColors.length];
    });
    common_vendor.index.onThemeChange(({ theme }) => {
      themeRef.value = theme;
    });
    common_vendor.onBeforeUnmount(() => {
      common_vendor.index.offThemeChange(() => {
        console.log("offThemeChange");
      });
    });
    common_vendor.onLoad(() => {
      console.log("欢迎使用 weapp-tailwindcss 模板");
    });
    function copy(data) {
      common_vendor.index.setClipboardData({
        data
      });
    }
    return (_ctx, _cache) => {
      return {
        a: common_vendor.t(common_vendor.unref(count)),
        b: common_vendor.n(common_vendor.unref(buttonClass)),
        c: common_vendor.o(
          //@ts-ignore
          (...args) => common_vendor.unref(increment) && common_vendor.unref(increment)(...args)
        ),
        d: common_vendor.o(($event) => copy("https://weapp-tw.icebreaker.top/docs/icons")),
        e: common_vendor.n(common_vendor.unref(classArray)),
        f: common_vendor.n(common_vendor.unref(classArray)),
        g: common_vendor.n(common_vendor.unref(classArray)),
        h: common_vendor.n(common_vendor.unref(classArray)),
        i: common_vendor.n(common_vendor.unref(classArray)),
        j: common_vendor.o(($event) => copy("https://weapp-tw.icebreaker.top/docs/quick-start/uni-app-css-macro"))
      };
    };
  }
});

const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-dc2ccdbb"]]);

wx.createPage(MiniProgramPage);