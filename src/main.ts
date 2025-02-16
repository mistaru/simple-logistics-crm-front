import { registerPlugins } from './plugins';
import App from './App.vue';
import { createApp } from 'vue';
import { createVuetify } from 'vuetify';
import { useAppStore } from './stores/app';
import http from './axios';
createVuetify();
const app = createApp(App);

registerPlugins(app);
const store = useAppStore();
app.config.globalProperties.$http = http;
store.setHttp(http);

app.mount('#app');
