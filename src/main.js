import { createApp } from "vue";
import VueDayjs from 'vue3-dayjs-plugin'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import "./style.scss";
import App from "./App.vue";

const app = createApp(App);

app.use(ElementPlus);
app.use(VueDayjs);
app.mount('#app');