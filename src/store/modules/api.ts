import { Module } from 'vuex';

// API
import { APIService } from '@/utils/api';

// Types
import type { IStore, IStoreModule, TFieldPayload } from '@/models/store';
import type { IGameUpdates } from '@/models/api';

const initialState: IStoreModule = {
  start: null,
  location: null,
  locationData: null,
  isEnter: false, // Cервер знает имя пользователя?
  game: null,
  updates: {},
  health: 100, // Не менять на null!!!
  isOnHit: false,
  isOnBodyHit: false,
  usersOnHit: [],
  map: null,
};

const api: Module<IStoreModule, IStore> = {
  namespaced: true,
  state: initialState,

  getters: {
    start: (state: IStoreModule) => state.start,
    location: (state: IStoreModule) => state.location,
    locationData: (state: IStoreModule) => state.locationData,
    isEnter: (state: IStoreModule) => state.isEnter,
    game: (state: IStoreModule) => state.game,
    updates: (state: IStoreModule) => state.updates,
    health: (state: IStoreModule) => state.health,
    isOnHit: (state: IStoreModule) => state.isOnHit,
    isOnBodyHit: (state: IStoreModule) => state.isOnBodyHit,
    usersOnHit: (state: IStoreModule) => state.usersOnHit,
    map: (state: IStoreModule) => state.map,
  },

  actions: {
    setApiState: ({ commit }, payload: TFieldPayload): void => {
      commit('setApiState', payload);
    },

    getLocation: ({ commit }, id): void => {
      APIService.getLocation(id).then((res) => {
        commit('getLocation', res);
      });
    },

    getMap: ({ commit }): void => {
      APIService.getMap().then((res) => {
        commit('getMap', res);
      });
    },

    reload: ({ commit }): void => {
      commit('reload');
    },

    // Websockets

    SOCKET_onConnect({ commit }, payload: IGameUpdates) {
      commit('SOCKET_onConnect', payload);
    },
  },

  mutations: {
    setApiState: (state: IStoreModule, payload: TFieldPayload): void => {
      if (payload.field === 'updates') {
        if (!payload.value) state[payload.field] = {};
        else
          state[payload.field] = {
            ...state[payload.field],
            ...payload.value,
          };
      } else state[payload.field] = payload.value;
    },

    getLocation: (state: IStoreModule, payload): void => {
      console.log('getLocation api store mutation: ', payload);
      state.locationData = payload;
    },

    getMap: (state: IStoreModule, payload): void => {
      console.log('getMap api store mutation: ', payload);
      state.map = payload;
    },

    reload: (state: IStoreModule): void => {
      state.location = initialState.location;
      state.locationData = initialState.locationData;
      state.isEnter = initialState.isEnter;
      state.game = initialState.game;
      state.updates = initialState.updates;
      state.health = initialState.health;
      state.isOnHit = initialState.isOnHit;
      state.isOnBodyHit = initialState.isOnBodyHit;
      state.usersOnHit = initialState.usersOnHit;
    },

    // Websockets

    SOCKET_onConnect: (state: IStoreModule, payload: IGameUpdates): void => {
      state.game = payload;
    },
  },
};

export default api;
