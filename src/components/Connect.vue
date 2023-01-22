<template>
  <div />
</template>

<script>
/* eslint-disable */
import { mapGetters, mapActions } from 'vuex';

// Constants
import { EmitterEvents } from '@/models/api';
import { DESIGN } from '@/utils/constants';

// Services
import emitter from '@/utils/emitter';

export default {
  name: 'Connect',

  data() {
    return {
      timeout: null,
      counter: DESIGN.UPDATE_TIME,
    };
  },

  sockets: {
    connect: () => {
      console.log('socket connected');
    },

    // Ответ сервера на соединение
    onConnect: () => {
      console.log('Connect sockets onConnect');
      emitter.emit(EmitterEvents.onConnect);
    },

    // Установка нового игрока
    setNewPlayer: (player) => {
      console.log('Connect sockets setNewPlayer', player);
      emitter.emit(EmitterEvents.setNewPlayer, player);
    },

    // Подтверждение старого игрока
    onUpdatePlayer: (player) => {
      console.log('Connect sockets onUpdatePlayer', player);
      emitter.emit(EmitterEvents.onUpdatePlayer, player);
    },

    // Реакция на заход в игру
    onEnter: (id) => {
      console.log('Connect sockets onEnter', id);
      emitter.emit(EmitterEvents.onEnter, id);
    },

    // Пришло обновление
    updateToClients: (game) => {
      // console.log('Connect sockets updateToClients', game);
      emitter.emit(EmitterEvents.updateToClients, game);
    },

    // Реакция на ответ на выстрел
    onShot: (shot) => {
      // console.log('Connect sockets onShot', shot);
      emitter.emit(EmitterEvents.onShot, shot);
    },

    // Реакция на ответ на удаление выстрела
    onUnshot: (id) => {
      // console.log('Connect sockets onUnshot', id);
      emitter.emit(EmitterEvents.onUnshot, id);
    },

    // Реакция на ответ на взрыв
    onExplosion: (updates) => {
      // console.log('Connect sockets onExplosion', updates);
      emitter.emit(EmitterEvents.onUnshot, updates.message.id);
      emitter.emit(EmitterEvents.onExplosion, updates.message);
      emitter.emit(EmitterEvents.hits, updates.updates);
    },

    // Реакция на ответ на самоповреждение
    onSelfharm: (message) => {
      // console.log('Connect sockets onSelfharm', message);
      emitter.emit(EmitterEvents.onSelfharm, message);
    },

    onRelocation: (id) => {
      // console.log('Connect sockets onRelocation', id);
      emitter.emit(EmitterEvents.onRelocation, id);
    },
  },

  computed: {
    ...mapGetters({
      game: 'api/game',
      updates: 'api/updates',
      location: 'api/location',

      id: 'persist/id',
      name: 'persist/name',
      isHide: 'persist/isHide',
      isRun: 'persist/isRun',
      isPause: 'persist/isPause',
      isGameOver: 'persist/isGameOver',
      isReload: 'persist/isReload',
    }),
  },

  created() {
    // Среагировать на ответ сервера на соединение
    this.emitter.on(EmitterEvents.onConnect, () => {
      console.log('Connect created onConnect!');
      this.$socket.emit(EmitterEvents.onOnConnect, { id: this.id });
      this.onConnect();
    });

    // Реагировать на установку нового игрока
    this.emitter.on(EmitterEvents.setNewPlayer, (player) => {
      // console.log('Connect created setNewPlayer', player);
      this.setNewPlayer(player);
    });

    // Реагировать на подтверждение старого игрока
    this.emitter.on(EmitterEvents.onUpdatePlayer, (player) => {
      // console.log('Connect created onUpdatePlayer', player);
      this.onUpdatePlayer(player);
    });

    // Реагировать на вход нового игрока
    this.emitter.on(EmitterEvents.enter, (name) => {
      // console.log('Connect created enter', id);
      this.$socket.emit(EmitterEvents.enter, {
        id: this.id,
        name,
      });
    });

    // Реагировать на отклик о входе в игру
    this.emitter.on(EmitterEvents.onEnter, () => {
      // console.log('Connect created onEnter');
      this.onEnter();
    });

    // Реагировать на переиграть
    this.emitter.on(EmitterEvents.reenter, () => {
      // console.log('Connect created reenter');
      this.$socket.emit(EmitterEvents.reenter, {
        id: this.id,
      });
    });

    // Реагировать на обновления
    this.emitter.on(EmitterEvents.updateToClients, (game) => {
      // console.log('Connect created updateToClients', game);
      this.updateToClients(game);
    });

    // Отправить обновления
    this.emitter.on(EmitterEvents.updateToServer, (updates) => {
      // console.log('Connect created updateToServer', updates);
      this.sendUpdates(updates);
    });
    // Запускаем регулярную отправку обновлений на сервер
    this.timeout = setInterval(() => {
      if (!this.isGameOver && !this.isReload)
        this.sendUpdates(this.getUpdates());
    }, process.env.VUE_APP_TIMEOUT || 25);

    // Реагировать на выстрел
    this.emitter.on(EmitterEvents.shot, (shot) => {
      // console.log('Connect created shot', shot);
      this.shot(shot);
    });

    // Реагировать на удаление выстрела
    this.emitter.on(EmitterEvents.unshot, (id) => {
      // console.log('Connect created unshot', id);
      this.unshot(id);
    });

    // Реагировать на взрыв
    this.emitter.on(EmitterEvents.explosion, (message) => {
      // console.log('Connect created explosion', message);
      this.explosion(message);
    });

    // Реагировать на обновления об уроне при взрывах
    this.emitter.on(EmitterEvents.hits, (updates) => {
      // console.log('Connect created hits', updates);
      this.onExplosion(updates);
    });

    // Реагировать на самоповреждения
    this.emitter.on(EmitterEvents.selfharm, (value) => {
      // console.log('Connect created selfharm', value);
      this.onSelfharm(value);
    });

    // Реагировать на ответ на самоповреждения
    this.emitter.on(EmitterEvents.onSelfharm, (message) => {
      // console.log('Connect created onSelfharm', message);
      this.onOnSelfharm(message);
    });

    // Переход на другую локацию
    this.emitter.on(EmitterEvents.relocation, (direction) => {
      // console.log('Connect created relocation', direction);
      this.relocation(direction);
    });
  },

  beforeDestroy() {
    clearInterval(this.timeout);
  },

  methods: {
    ...mapActions({
      setApiState: 'api/setApiState',
      setPersistState: 'persist/setPersistState',
    }),

    // Произошло соединение с сервером
    onConnect() {
      console.log('Connect Запускаем процесс!!!');
    },

    // Реагировать на установку нового игрока
    setNewPlayer(player) {
      console.log('Connect setNewPlayer', player);
      this.setPersistState({
        field: 'id',
        value: player.id,
      }).then(() => {
        this.setStart(player);

        // Установливаем локацию
        this.setApiState({
          field: 'location',
          value: player.location,
        });
      });
    },

    // На подтверждение старого игрока
    onUpdatePlayer(player) {
      console.log('Connect onUpdatePlayer', player);
      this.setStart(player);

      // Установливаем локацию
      this.setApiState({
        field: 'location',
        value: player.location,
      });

      // Проверяем ник и пускаем в игру
      if (this.name && this.name === player.name) {
        this.setApiState({
          field: 'health',
          value: player.health,
        }).then(() => {
          this.setApiState({
            field: 'isEnter',
            value: true,
          });
        });
      }
    },

    // Установка стартовых значений игрока
    setStart(player) {
      this.setApiState({
        field: 'start',
        value: {
          positionX: player.positionX,
          positionY: player.positionY,
          positionZ: player.positionZ,
          directionX: player.directionX,
          directionY: player.directionY,
          directionZ: player.directionZ,
        },
      });
    },

    // Заход в игру
    onEnter() {
      setTimeout(() => {
        // Проверяем есть ли имя у юзера (не пускаем в игру без имени)
        if (this.game.users && this.game.users.length) {
          const item = this.game.users.find((player) => player.id === this.id);

          if (item && item.name) {
            this.setPersistState({
              field: 'isPause',
              value: false,
            }).then(() => {
              this.setApiState({
                field: 'isEnter',
                value: true,
              });
            });
          }
        }
      }, process.env.VUE_APP_TIMEOUT || 25);
    },

    // Постоянные обновления от сервера
    updateToClients(game) {
      // console.log('Connect updateToClients!!!', game);
      this.setApiState({
        field: 'game',
        value: game,
      });
    },

    // Отобрать обновления для отправки
    getUpdates() {
      // console.log('Connect getUpdates!!!');
      ++this.counter;
      if (this.counter > DESIGN.UPDATE_TIME) {
        this.counter = 0;
        return {
          ...JSON.parse(JSON.stringify(this.updates)),
          time: Math.round(new Date().getTime() / 1000.0),
        };
      }
      return JSON.parse(JSON.stringify(this.updates));
    },

    // Отправить обновления серверу
    sendUpdates(updates) {
      if (!this.isPause) {
        this.setApiState({
          field: 'updates',
          value: {},
        }).then(() => {
          this.$socket.emit(EmitterEvents.updateToServer, {
            id: this.id,
            ...updates,
          });
        });
      }
    },

    // Выстрел
    shot(shot) {
      // console.log('Connect shot()', shot);
      this.$socket.emit(EmitterEvents.shot, shot);
    },

    // Выстрел улетел
    unshot(id) {
      // console.log('Connect unshot()', id);
      this.$socket.emit(EmitterEvents.unshot, id);
    },

    // Взрыв
    explosion(message) {
      // console.log('Connect explosion()', message);
      this.$socket.emit(EmitterEvents.explosion, message);
    },

    // На ответ на взрыв - прилетел урон?
    onExplosion(updates) {
      // console.log('Connect onExplosion()', updates);
      const user = updates.find((player) => player.id === this.id);
      if (user) {
        if (user.health <= 0) {
          // Проиграл
          this.setPersistState({
            field: 'isGameOver',
            value: true,
          });
        }
        // Урон
        else {
          this.setApiState({
            field: 'isOnHit',
            value: true,
          }).then(() => {
            if (user.is)
              this.setApiState({
                field: 'isOnBodyHit',
                value: true,
              });

            setTimeout(() => {
              this.setApiState({
                field: 'isOnHit',
                value: false,
              }).then(() => {
                if (user.is)
                  this.setApiState({
                    field: 'isOnBodyHit',
                    value: false,
                  });
              });
            }, DESIGN.HIT_TIMEOUT);
          });
        }

        this.setApiState({
          field: 'health',
          value: user.health,
        });
      }

      const users = updates
        .filter((player) => player.is)
        .map((player) => {
          return player.id;
        });
      if (users && users.length)
        this.setApiState({
          field: 'usersOnHit',
          value: users,
        });
    },

    // Самоповреждение
    onSelfharm(value) {
      // console.log('Connect onSelfharm()', value);
      this.$socket.emit(EmitterEvents.selfharm, {
        id: this.id,
        location: this.location,
        value,
      });
      this.setApiState({
        field: 'isOnHit',
        value: true,
      }).then(() => {
        setTimeout(() => {
          this.setApiState({
            field: 'isOnHit',
            value: false,
          });
        }, DESIGN.HIT_TIMEOUT);
      });
    },

    // На самоповреждение
    onOnSelfharm(message) {
      console.log('Connect onOnSelfharm()', message, this.id);
      if (message.id === this.id) {
        this.setApiState({
          field: 'health',
          value: message.health,
        });
      }
    },

    relocation(direction) {
      this.$socket.emit(EmitterEvents.relocation, {
        id: this.id,
        location: this.location,
        direction,
      });
    },
  },
};
</script>
