import { Module } from 'vuex';

// Types
import type { IStore, IStoreModule, TFieldPayload } from '@/models/store';

const initialState: IStoreModule = {
  language: null,
  id: null,
};

const persist: Module<IStoreModule, IStore> = {
  namespaced: true,
  state: initialState,

  getters: {
    language: (state: IStoreModule) => state.language,
    id: (state: IStoreModule) => state.id,
  },

  actions: {
    setPersistState: ({ commit }, payload: TFieldPayload): void => {
      commit('setPersistState', payload);
    },
  },

  mutations: {
    setPersistState: (state: IStoreModule, payload: TFieldPayload): void => {
      state[payload.field] = payload.value;
    },
  },
};

export default persist;
