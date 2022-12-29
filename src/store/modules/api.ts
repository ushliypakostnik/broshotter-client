import { Module } from 'vuex';

// API
import { APIService } from '@/utils/api';

// Types
import type { IStore, IStoreModule } from '@/models/store';
import type { IIndex } from '@/models/api';

const initialState: IStoreModule = {};

const api: Module<IStoreModule, IStore> = {
  namespaced: true,
  state: initialState,

  getters: {},

  actions: {
    // Test REST API
    index: ({ commit }, payload: IIndex): void => {
      APIService.index(payload).then((res: IIndex) => {
        commit('index', res);
      });
    },
  },

  mutations: {
    // Test REST API
    index: (state: IStoreModule): void => {
      console.log('api.js mutation: ', state);
    },
  },
};

export default api;
