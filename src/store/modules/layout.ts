import { Module } from 'vuex';

// Types
import type {
  IStore,
  IStoreModule,
  TFieldPayload,
  TEventMessagePayload,
} from '@/models/store';

const initialState: IStoreModule = {
  isGame: false, // Cервер знает имя пользователя?
  isPause: true, // Сейчас пауза?
  isReload: true, // Если нужно принудительно перезагрузить, сейчас не используется
  messages: [], // Сообщения сейчас
};

let array: Array<TEventMessagePayload> = [];

const layout: Module<IStoreModule, IStore> = {
  namespaced: true,
  state: initialState,

  getters: {
    isGame: (state: IStoreModule) => state.isGame,
    isPause: (state: IStoreModule) => state.isPause,
    isReload: (state: IStoreModule) => state.isReload,
    messages: (state: IStoreModule) => state.messages,
  },

  actions: {
    setLayoutState: ({ commit }, payload: TFieldPayload): void => {
      commit('setLayoutState', payload);
    },

    showMessage: ({ commit }, payload: TEventMessagePayload): void => {
      commit('showMessage', payload);
    },

    hideMessage: ({ commit }, payload: number): void => {
      commit('hideMessage', payload);
    },
  },

  mutations: {
    setLayoutState: (state: IStoreModule, payload: TFieldPayload): void => {
      state[payload.field] = payload.value;
    },

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

export default layout;
