import { Module } from 'vuex';

// Types
import type { IStore, IPreloader } from '@/models/store';

const FLAG = 'isLocationLoaded';

let stateCopy;
let result;

const initialState: IPreloader = {
  [`${FLAG}`]: false,

  // Textures
  skyIsLoaded: false,
  groundIsLoaded: false,

  // Models
  treesIsLoaded: false,

  // World build
  skyIsBuild: false,
  groundIsBuild: false,
  treesIsBuild: false,
  atmosphereIsBuild: false,
};

const location: Module<IPreloader, IStore> = {
  namespaced: true,
  state: initialState,

  getters: {
    isLocationLoaded: (state: IPreloader) => state[FLAG],
  },

  actions: {
    preloadOrBuilt: ({ commit }, field: string): void => {
      commit('preloadOrBuilt', field);
    },

    isAllLoadedAndBuild: ({ commit }): void => {
      commit('isAllLoadedAndBuild');
    },
  },

  mutations: {
    preloadOrBuilt: (state: IPreloader, field: string) => {
      state[field] = true;
    },

    isAllLoadedAndBuild: (state: IPreloader) => {
      stateCopy = Object.assign({}, state);
      delete stateCopy[FLAG];
      result = Object.values(stateCopy).every((field) => field === true);
      if (result) {
        state[FLAG] = true;
      }
    },
  },
};

export default location;
