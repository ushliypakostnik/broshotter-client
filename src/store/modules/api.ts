import { Module } from 'vuex';

// API
import { APIService } from '@/utils/api';

// Types
import type { IStore, IStoreModule, TFieldPayload } from '@/models/store';
import type { IGameUpdates, IIndex } from '@/models/api';

const initialState: IStoreModule = {
  game: null,
  updates: {},
};

const api: Module<IStoreModule, IStore> = {
  namespaced: true,
  state: initialState,

  getters: {
    game: (state: IStoreModule) => state.game,
    updates: (state: IStoreModule) => state.updates,
  },

  actions: {
    setApiState: (state, payload: TFieldPayload): void => {
      // console.log('api store actions: ', payload);
      state.commit('setApiState', payload);
    },

    // Test REST API
    index: ({ commit }, payload: IIndex): void => {
      APIService.index(payload).then((res: IIndex) => {
        commit('index', res);
      });
    },

    // Websockets

    SOCKET_onConnect({ commit }, payload: IGameUpdates) {
      commit('SOCKET_onConnect', payload);
    },
  },

  mutations: {
    setApiState: (state: IStoreModule, payload: TFieldPayload): void => {
      // console.log('api store mutations: ', payload);
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

    // Websockets

    SOCKET_onConnect: (state: IStoreModule, payload: IGameUpdates): void => {
      state.game = payload;
    },
  },
};

export default api;
