import {createApp} from "vue";
import * as ElementPlusIconsVue from "@element-plus/icons-vue";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import Unicon from "vue-unicons";
import {uniDesktop, uniPizzaSlice, uniGithub} from "vue-unicons/dist/icons";
import "./style.scss";

import BubbleEffect from "./components/BubbleEffect/BubbleEffect.vue";
import App from "./App.vue";

import * as db from "./utils/db";

await db.initDatabase();

const app = createApp(App);
app.component("BubbleEffect", BubbleEffect);

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

Unicon.add([uniDesktop, uniPizzaSlice, uniGithub]);

app.use(ElementPlus);
app.use(Unicon);
app.mount("#app");
