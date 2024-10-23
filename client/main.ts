import "@/assets/main.css";
import "purecss";

import { createPinia } from "pinia";
import piniaPluginPersistedState from "pinia-plugin-persistedstate";
import { createApp } from "vue";

import { BiPersonFill, IoPeopleCircleSharp, BiGearFill, BiPersonCircle, BiInboxFill, IoPeopleSharp, FaHouseUser } from "oh-vue-icons/icons";
import { OhVueIcon, addIcons } from "oh-vue-icons";

addIcons(BiPersonFill, BiPersonCircle, IoPeopleCircleSharp, IoPeopleSharp, BiGearFill, BiInboxFill, FaHouseUser);

import App from "./App.vue";
import router from "./router";

const app = createApp(App);
const pinia = createPinia();
pinia.use(piniaPluginPersistedState);

app.use(pinia);
app.use(router);

app.component("v-icon", OhVueIcon);
app.mount("#app");
