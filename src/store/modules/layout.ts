import { Module } from 'vuex';

// Types
import type {
  IStore,
  IStoreModule,
  TFieldPayload,
  TEventMessagePayload,
} from '@/models/store';

const initialState: IStoreModule = {
  id: null,
  name: null,

  language: null,
  isPause: true, // Сейчас пауза?
  isGameOver: false, // Умер?
  isReload: true, // Если нужно принудительно перезагрузить, сейчас не используется
  messages: [], // Сообщения сейчас

  // Gameplay
  endurance: 100,
  isHide: false,
  isRun: false,
  isJump: false,
  isOptical: false,
  isTired: false,
  day: 0,
};

let array: Array<TEventMessagePayload> = [];

const layout: Module<IStoreModule, IStore> = {
  namespaced: true,
  state: initialState,

  getters: {
    id: (state: IStoreModule) => state.id,
    name: (state: IStoreModule) => state.name,
    language: (state: IStoreModule) => state.language,
    isPause: (state: IStoreModule) => state.isPause,
    isReload: (state: IStoreModule) => state.isReload,
    endurance: (state: IStoreModule) => state.endurance,
    isHide: (state: IStoreModule) => state.isHide,
    isRun: (state: IStoreModule) => state.isRun,
    isJump: (state: IStoreModule) => state.isJump,
    isOptical: (state: IStoreModule) => state.isOptical,
    isTired: (state: IStoreModule) => state.isTired,
    messages: (state: IStoreModule) => state.messages,
    isGameOver: (state: IStoreModule) => state.isGameOver,
    day: (state: IStoreModule) => state.day,
  },

  actions: {
    setLayoutState: (context, payload: TFieldPayload): void => {
      if (
        payload.field === 'endurance' &&
        context.getters.endurance < 1 &&
        !context.getters.isTired
      )
        context.commit('setLayoutState', { field: 'isTired', value: true });
      else if (
        payload.field === 'endurance' &&
        context.getters.endurance > 100 &&
        context.getters.isTired
      )
        context.commit('setLayoutState', { field: 'isTired', value: false });
      else context.commit('setLayoutState', payload);
    },

    showMessage: ({ commit }, payload: TEventMessagePayload): void => {
      commit('showMessage', payload);
    },

    hideMessage: ({ commit }, payload: number): void => {
      commit('hideMessage', payload);
    },

    reload: ({ commit }): void => {
      commit('reload');
    },
  },

  mutations: {
    setLayoutState: (state: IStoreModule, payload: TFieldPayload): void => {
      if (payload.field === 'endurance') {
        if (state[payload.field] < 100 && payload.value > 0)
          state[payload.field] += payload.value;
        else if (state[payload.field] > 100 && payload.value > 0)
          state[payload.field] = 100;
        else state[payload.field] += payload.value;
      } else state[payload.field] = payload.value;
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

    reload: (state: IStoreModule): void => {
      state.id = initialState.id;
      state.name = initialState.name;
      state.isPause = initialState.isPause;
      state.endurance = initialState.endurance;
      state.isHide = initialState.isHide;
      state.isRun = initialState.isRun;
      state.isJump = initialState.isJump;
      state.isOptical = initialState.isOptical;
      state.isTired = initialState.isTired;
      state.messages = initialState.messages;
      state.isGameOver = initialState.isGameOver;
    },
  },
};

export default layout;
