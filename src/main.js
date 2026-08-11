import "./utils/format";
import { createApp } from "vue";
import "@/assets/font/font.css";
import "element-plus/theme-chalk/index.css";
import "./style/common/index.less";
import App from "./App.vue";
import router from "@/router";
import store from "@/store";
import "@/utils/rem.js";
// 图标
import * as ElementPlusIconsVue from "@element-plus/icons-vue";
import ElementPlus from "element-plus";
import zhCn from "element-plus/dist/locale/zh-cn.mjs";
import "default-passive-events";

const app = createApp(App);
app.use(store);
app.use(ElementPlus, { locale: zhCn });
app.use(router);
app.mount("#app");
for (const [name, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(name, component);
}