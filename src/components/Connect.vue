<template>
  <div />
</template>

<script>
/* eslint-disable */
import { mapActions } from 'vuex';

// Constants
import { EmitterEvents } from '@/utils/constants';

// Services
import emitter from "@/utils/emitter";

export default {
  name: 'Connect',

  sockets: {
    connect: () => {
      console.log('socket connected');
    },

    // Ответ сервера на соединение
    onConnect: (data) => {
      console.log('Connect sockets onConnect', data);
      emitter.emit(EmitterEvents.onConnect, data);
    },

    // Пришло обновление
    updateToClients: (data) => {
      // console.log('Connect sockets updateToClients', data);
      emitter.emit(EmitterEvents.updateToClients, data);
    },

    // Ответ сервера на обноеления от клиента
    onUpdateToServer: (data) => {
      // console.log('Connect sockets onUpdateToServer', data);
      emitter.emit(EmitterEvents.onUpdateToServer, data);
    },
  },

  created() {
    // Среагировать на ответ сервера на соединение
    this.emitter.on(EmitterEvents.onConnect, (data) => {
      console.log('Connect created onConnect', data);
      this.$socket.emit(EmitterEvents.onOnConnect, data);
      this.onConnect(data);
    });

    // Реагировать на обновления
    this.emitter.on(EmitterEvents.updateToClients, (data) => {
      // console.log('Connect created updateToClients', data);
      this.updateToClients(data);
    });


    // Отправить обновления
    this.emitter.on(EmitterEvents.updateToServer, (data) => {
      console.log('Connect created updateToServer', data);
      this.$socket.emit(EmitterEvents.updateToServer, data);
    });

    // Среагировать на ответ на обновления
    this.emitter.on(EmitterEvents.onUpdateToServer, () => {
      console.log('Connect onUpdateToServer');
      this.onUpdateToServer();
    });
  },

  methods: {
    ...mapActions({
      setApiState: 'api/setApiState',
    }),

    // Произошло соединение с сервером
    onConnect(data) {
      console.log('Запускаем процесс!!!', data);
    },

    // Постоянные обновления от сервера
    updateToClients(data) {
      // console.log('Обновление!!!', data);
      this.setApiState({
        field: 'game',
        value: data,
      });
    },

    // Обновления серверу
    onUpdateToServer() {
      console.log('Connect onUpdateToServer!!!');
    },
  },
};
</script>
