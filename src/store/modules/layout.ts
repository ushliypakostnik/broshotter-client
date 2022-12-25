import { Module } from 'vuex';

// Types
import type {
  IStore,
  ILayout,
  TFieldPayload,
  TEventMessagePayload,
} from '@/models/store';

const initialState: ILayout = {
  language: null,
  controls: {
    camera: {
      x: null,
      y: null,
      z: null,
    },
    target: {
      x: null,
      y: null,
      z: null,
    },
  },
  isPause: true,
  isReload: true,
  messages: [],
  clock: 0,
};

let array: Array<TEventMessagePayload> = [];

const layout: Module<ILayout, IStore> = {
  namespaced: true,
  state: initialState,

  getters: {
    language: (state: ILayout) => state.language,
    controls: (state: ILayout) => state.controls,
    isPause: (state: ILayout) => state.isPause,
    isReload: (state: ILayout) => state.isReload,
    messages: (state: ILayout) => state.messages,
    clock: (state: ILayout) => state.clock,
  },

  actions: {
    setField: ({ commit }, payload: TFieldPayload): void => {
      commit('setField', payload);
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
    setField: (state: ILayout, payload: TFieldPayload): void => {
      state[payload.field] = payload.value;
    },

    showMessage: (state: ILayout, payload: TEventMessagePayload): void => {
      array = state.messages;
      array.push(payload);
      state.messages = array;
    },

    hideMessage: (state: ILayout, payload: number): void => {
      array = state.messages.filter(
        (message: TEventMessagePayload) => message.id !== payload,
      );
      state.messages = array;
    },

    reload: (state: ILayout): void => {
      state.isPause = true;
      state.controls = initialState.controls;
      state.messages = initialState.messages;
      state.clock = initialState.clock;
      state.messages = initialState.messages;
    },
  },
};

export default layout;
