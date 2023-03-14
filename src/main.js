import {createApp} from "vue";
import {createI18n} from "vue-i18n";
import langs from "./i18n";
import * as ElementPlusIconsVue from "@element-plus/icons-vue";
import ElementPlus from "element-plus";
import ElementKo from "element-plus/dist/locale/ko.min.mjs";
import "element-plus/dist/index.css";
import Unicon from "vue-unicons";
import {
  uniDesktop,
  uniPizzaSlice,
  uniGithub,
  uniSearch,
  uniPlus,
  uniFileDownload,
  uniTrash,
} from "vue-unicons/dist/icons";
import "./style.scss";
import BubbleEffect from "./components/BubbleEffect/BubbleEffect.vue";
import App from "./App.vue";
import * as db from "./utils/db";

const i18n = createI18n({
  locale: "ko",
  fallbackLocale: "en",
  messages: langs,
});

await db.initDatabase();

const app = createApp(App);
app.component("BubbleEffect", BubbleEffect);

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

Unicon.add([
  uniDesktop,
  uniPizzaSlice,
  uniGithub,
  uniSearch,
  uniPlus,
  uniFileDownload,
  uniTrash,
]);

app.use(i18n);
app.use(ElementPlus, {
  locale: ElementKo,
});
app.use(Unicon);
app.mount("#app");
