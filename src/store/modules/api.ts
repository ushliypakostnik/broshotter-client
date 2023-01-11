import { Module } from 'vuex';

// API
import { APIService } from '@/utils/api';

// Types
import type { IStore, IStoreModule, TFieldPayload } from '@/models/store';
import type { IGameUpdates, IIndex, IUser } from '@/models/api';

const initialState: IStoreModule = {
  isEnter: false, // Cервер знает имя пользователя?
  game: null,
  updates: {},
  health: 100,
  isOnHit: false,
  isOnBodyHit: false,
};

let player;

const api: Module<IStoreModule, IStore> = {
  namespaced: true,
  state: initialState,

  getters: {
    isEnter: (state: IStoreModule) => state.isEnter,
    game: (state: IStoreModule) => state.game,
    updates: (state: IStoreModule) => state.updates,
    health: (state: IStoreModule) => state.health,
    isOnHit: (state: IStoreModule) => state.isOnHit,
    isOnBodyHit: (state: IStoreModule) => state.isOnBodyHit,
  },

  actions: {
    setApiState: ({ commit }, payload: TFieldPayload): void => {
      commit('setApiState', payload);
    },

    // Test REST API
    index: ({ commit }, payload: IIndex): void => {
      APIService.index(payload).then((res: IIndex) => {
        commit('index', res);
      });
    },

    reload: ({ commit }): void => {
      commit('reload');
    },

    // Websockets

    SOCKET_onConnect({ commit }, payload: IGameUpdates) {
      commit('SOCKET_onConnect', payload);
    },
  },

  mutations: {
    setApiState: (state: IStoreModule, payload: TFieldPayload): void => {
      if (payload.field === 'updates') {
        if (!payload.value) state[payload.field] = {};
        else
          state[payload.field] = {
            ...state[payload.field],
            ...payload.value,
          };
      } else state[payload.field] = payload.value;
    },

    // Test REST API
    index: (state: IStoreModule): void => {
      console.log('api store mutation: ', state);
    },

    reload: (state: IStoreModule): void => {
      state.isEnter = initialState.isEnter;
      state.game = initialState.game;
      state.updates = initialState.updates;
    },

    // Websockets

    SOCKET_onConnect: (state: IStoreModule, payload: IGameUpdates): void => {
      state.game = payload;
    },
  },
};

export default api;
