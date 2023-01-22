import { Module } from 'vuex';

// Types
import type { IStore, IStoreModule, TFieldPayload } from '@/models/store';

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
  isTired: false,
  day: 0,
};

const persist: Module<IStoreModule, IStore> = {
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
    isTired: (state: IStoreModule) => state.isTired,
    isGameOver: (state: IStoreModule) => state.isGameOver,
    day: (state: IStoreModule) => state.day,
  },

  actions: {
    setPersistState: (context, payload: TFieldPayload): void => {
      if (
        payload.field === 'endurance' &&
        context.getters.endurance < 1 &&
        !context.getters.isTired
      )
        context.commit('setPersistState', { field: 'isTired', value: true });
      else if (
        payload.field === 'endurance' &&
        context.getters.endurance > 100 &&
        context.getters.isTired
      )
        context.commit('setPersistState', { field: 'isTired', value: false });
      else context.commit('setPersistState', payload);
    },

    reload: ({ commit }): void => {
      commit('reload');
    },
  },

  mutations: {
    setPersistState: (state: IStoreModule, payload: TFieldPayload): void => {
      if (payload.field === 'endurance') {
        if (state[payload.field] < 100 && payload.value > 0)
          state[payload.field] += payload.value;
        else if (state[payload.field] > 100 && payload.value > 0)
          state[payload.field] = 100;
        else state[payload.field] += payload.value;
      } else state[payload.field] = payload.value;
    },

    reload: (state: IStoreModule): void => {
      state.name = initialState.name;
      state.isPause = initialState.isPause;
      state.endurance = initialState.endurance;
      state.isHide = initialState.isHide;
      state.isRun = initialState.isRun;
      state.isJump = initialState.isJump;
      state.isTired = initialState.isTired;
      state.isGameOver = initialState.isGameOver;
    },
  },
};

export default persist;
