import { createApp } from 'vue';
import { createI18n } from 'vue-i18n';
import App from './App.vue';
import { store, key } from './store';
import mitt from 'mitt';

// Websockets
import VueSocketIO from 'vue-3-socket.io';

// Constants
import { LANGUAGES, MESSAGES, API_URL } from '@/utils/constants';

const i18n = createI18n({
  legacy: true,
  locale: store.getters['persist/language']
    ? store.getters['persist/language']
    : LANGUAGES[0],
  fallbackLocale: LANGUAGES[0],
  messages: MESSAGES,
});

const socketio = new VueSocketIO({
  debug: true,
  connection: API_URL,
  vuex: {
    store,
    actionPrefix: 'SOCKET_',
    mutationPrefix: 'SOCKET_',
  },
});

const emitter = mitt();

const app = createApp(App)
  .use(i18n)
  .use(store, key)
  .use(socketio);
app.config.globalProperties.emitter = emitter;
app.mount('#app');
