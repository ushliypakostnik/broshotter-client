<template>
  <div />
</template>

<script>
/* eslint-disable */
import { mapGetters, mapActions } from 'vuex';

// Constants
import { EmitterEvents } from '@/models/api';

// Services
import emitter from '@/utils/emitter';

export default {
  name: 'Connect',

  data() {
    return {
      timeout: null,
    };
  },

  sockets: {
    connect: () => {
      console.log('socket connected');
    },

    // Ответ сервера на соединение
    onConnect: (game) => {
      console.log('Connect sockets onConnect', game);
      emitter.emit(EmitterEvents.onConnect, game);
    },

    // Установка нового игрока
    setNewPlayer: (id) => {
      console.log('Connect sockets setNewPlayer', id);
      emitter.emit(EmitterEvents.setNewPlayer, id);
    },

    // Пришло обновление
    updateToClients: (game) => {
      // console.log('Connect sockets updateToClients', game);
      emitter.emit(EmitterEvents.updateToClients, game);
    },
  },

  computed: {
    ...mapGetters({
      id: 'persist/id',
      isGame: 'layout/isGame',
      updates: 'api/updates',
    }),
  },

  created() {
    // Среагировать на ответ сервера на соединение
    this.emitter.on(EmitterEvents.onConnect, (game) => {
      console.log('Connect created onConnect', game);
      this.$socket.emit(EmitterEvents.onOnConnect, { id: this.id });
      this.onConnect(game);
    });

    // Реагировать на обновления
    this.emitter.on(EmitterEvents.updateToClients, (game) => {
      // console.log('Connect created updateToClients', game);
      this.updateToClients(game);
    });

    // Реагировать на установку нового игрока
    this.emitter.on(EmitterEvents.setNewPlayer, (id) => {
      // console.log('Connect created setNewPlayer', id);
      this.setNewPlayer(id);
    });

    // Отправить обновления
    this.emitter.on(EmitterEvents.updateToServer, (updates) => {
      console.log('Connect created updateToServer', updates);
      this.sendUpdates(updates);
    });

    // Запускаем регулярную отправку обновлений на сервер
    this.timeout = setInterval(() => {
      this.sendUpdates(this.getUpdates());
    }, process.env.VUE_APP_TIMEOUT || 75);
  },

  beforeDestroy() {
    clearInterval(this.timeout);
  },

  methods: {
    ...mapActions({
      setApiState: 'api/setApiState',
      setPersistState: 'persist/setPersistState',
      setLayoutState: 'layout/setLayoutState',
    }),

    // Произошло соединение с сервером
    onConnect(game) {
      console.log('Запускаем процесс!!!', game);
    },

    // Реагировать на установку нового игрока
    setNewPlayer(player) {
      console.log('Connect setNewPlayer', player);
      this.setPersistState({
        field: 'id',
        value: player.id,
      });
    },

    // Постоянные на обновления от сервера
    updateToClients(game) {
      // console.log('Connect updateToClients!!!', game);
      this.setApiState({
        field: 'game',
        value: game,
      }).then(() => {
        // Проверяем есть ли имя у юзера (не пускаем в игру без имени)
        if (!this.isGame && game.users && game.users.length) {
          const item = game.users.find((player) => player.id === this.id);
          if (item && item.updates && item.updates.name)
            this.setLayoutState({
              field: 'isGame',
              value: true,
            });
        }
      });
    },

    // Отобрать обновления для отправки
    getUpdates() {
      return JSON.parse(JSON.stringify(this.updates));
    },

    // Отправить обновления серверу
    sendUpdates(updates) {
      this.setApiState({
        field: 'updates',
        value: null,
      }).then(() => {
        this.$socket.emit(EmitterEvents.updateToServer, {
          id: this.id,
          updates,
        });
      });
    },
  },
};
</script>
