import "\0plugin-vue:export-helper";
import "uni-mp-runtime";
import "./pages-json-js";
import * as Pinia from "pinia";
import { createSSRApp } from "vue";
import App from "./App.vue";
export function createApp() {
  const app = createSSRApp(App);
  app.use(Pinia.createPinia());
  return {
    app,
    Pinia
  };
}
;
createApp().app.mount("#app");
