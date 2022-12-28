import { Module } from 'vuex';

// API
import { APIService } from '@/utils/api';

// Types
import type { IStore, IStoreModule } from '@/models/store';
import type { IEnter } from '@/models/api';

const initialState: IStoreModule = {
  language: null,
};

const api: Module<IStoreModule, IStore> = {
  namespaced: true,
  state: initialState,

  getters: {
    language: (state: IStoreModule) => state.language,
  },

  actions: {
    enter: ({ commit }, payload: IEnter): void => {
      APIService.enter(payload).then((res: IEnter) => {
        commit('setUser', res);
      });
    },
  },

  mutations: {
    enter: (state: IStoreModule): void => {
      console.log('api.js mutation: ', state);
    },
  },
};

export default api;
