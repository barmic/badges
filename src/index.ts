import { createApp } from 'vue';
import App from './App.vue';

declare global {
  var __VUE_OPTIONS_API__: boolean;
  var __VUE_PROD_DEVTOOLS__: boolean;
}

if (process.env.NODE_ENV === 'development') {
  globalThis.__VUE_OPTIONS_API__ = true
  globalThis.__VUE_PROD_DEVTOOLS__ = true;
} else {
  globalThis.__VUE_OPTIONS_API__ = false;
  globalThis.__VUE_PROD_DEVTOOLS__ = false;
}

const app = createApp(App);
app.mount('#app');
