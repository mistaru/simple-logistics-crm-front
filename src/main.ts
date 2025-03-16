import { createApp } from 'vue';
import 'vuetify/styles';

import App from './App.vue';
import vuetify from '@/plugins/vuetify';
import router from './router';
import { createPinia } from 'pinia';
import { useAppStore } from './stores/app';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(vuetify);
app.use(router);

router.isReady().then(() => {
  app.mount('#app');
});
