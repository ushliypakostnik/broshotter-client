import { Module } from 'vuex';

// API
import { APIService } from '@/utils/api';

// Types
import type {IStore, IStoreModule, TFieldPayload} from '@/models/store';
import type { IGameState, IIndex } from '@/models/api';

const initialState: IStoreModule = {
  game: null,
};

const api: Module<IStoreModule, IStore> = {
  namespaced: true,
  state: initialState,

  getters: {
    game: (state: IStoreModule) => state.game,
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

    // Websockets

    SOCKET_onConnect({ commit }, payload: IGameState) {
      commit('update', payload);
    },
  },

  mutations: {
    setApiState: (state: IStoreModule, payload: TFieldPayload): void => {
      state[payload.field] = payload.value;
    },

    // Test REST API
    index: (state: IStoreModule): void => {
      console.log('api.js mutation: ', state);
    },

    // Websockets

    update: (state: IStoreModule, payload: IGameState): void => {
      state.game = payload;
    },
  },
};

export default api;
