import { defineComponent as _defineComponent } from "vue";

import { onLaunch, onShow, onHide } from '@dcloudio/uni-app';
export default /* @__PURE__ */ _defineComponent({
  __name: "App",
  setup(__props) {
    onLaunch(() => {
      console.log("App Launch");
    });
    onShow(() => {
      console.log("App Show");
    });
    onHide(() => {
      console.log("App Hide");
    });
    return () => {
    };
  }
});
