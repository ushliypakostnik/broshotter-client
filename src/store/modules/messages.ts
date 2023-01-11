import { Module } from 'vuex';

// Types
import type {
  IStore,
  IStoreModule,
  TEventMessagePayload,
} from '@/models/store';

const initialState: IStoreModule = {
  messages: [], // Сообщения сейчас
};

let array: Array<TEventMessagePayload> = [];

const messages: Module<IStoreModule, IStore> = {
  namespaced: true,
  state: initialState,

  getters: {
    messages: (state: IStoreModule) => state.messages,
  },

  actions: {
    showMessage: ({ commit }, payload: TEventMessagePayload): void => {
      commit('showMessage', payload);
    },

    hideMessage: ({ commit }, payload: number): void => {
      commit('hideMessage', payload);
    },
  },

  mutations: {
    showMessage: (state: IStoreModule, payload: TEventMessagePayload): void => {
      array = state.messages;
      array.push(payload);
      state.messages = array;
    },

    hideMessage: (state: IStoreModule, payload: number): void => {
      array = state.messages.filter(
        (message: TEventMessagePayload) => message.id !== payload,
      );
      state.messages = array;
    },
  },
};

export default messages;
