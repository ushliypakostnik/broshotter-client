import { Module } from 'vuex';

// Types
import type { IStore, IPreloader } from '@/models/store';

const FLAG = 'isGameLoaded';

let stateCopy;
let result;

const initialState: IPreloader = {
  [`${FLAG}`]: false,

  // Textures
  skyIsLoaded: false,
  sandIsLoaded: false,
  groundIsLoaded: false,
  concretteIsLoaded: false,
  metallIsLoaded: false,

  // Models
  enemiesIsLoaded: false,
  heroIsLoaded: false,
  worldIsLoaded: false,
  playersIsLoaded: false,

  // Audio
  windIsLoaded: false,
  stepsIsLoaded: false,
  jumpstartIsLoaded: false,
  jumpendIsLoaded: false,
  shotIsLoaded: false,
  hitIsLoaded: false,

  // World build
  atmosphereIsBuild: false,
  playersIsBuild: false,
  heroIsBuild: false,
  enemiesIsBuild: false,
  worldIsBuild: false,
};

const preloader: Module<IPreloader, IStore> = {
  namespaced: true,
  state: initialState,

  getters: {
    isGameLoaded: (state: IPreloader) => state[FLAG],
  },

  actions: {
    preloadOrBuilt: ({ commit }, field: string): void => {
      commit('preloadOrBuilt', field);
    },

    isAllLoadedAndBuilt: ({ commit }): void => {
      commit('isAllLoadedAndBuilt');
    },
  },

  mutations: {
    preloadOrBuilt: (state: IPreloader, field: string) => {
      state[field] = true;
    },

    isAllLoadedAndBuilt: (state: IPreloader) => {
      stateCopy = Object.assign({}, state);
      delete stateCopy[FLAG];
      result = Object.values(stateCopy).every((field) => field === true);
      if (result) state[FLAG] = true;
    },
  },
};

export default preloader;
