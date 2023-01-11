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
  fireIsLoaded: false,

  // Models
  enemiesIsLoaded: false,
  worldIsLoaded: false,
  playersIsLoaded: false,
  treeIsLoaded: false,
  leninIsLoaded: false,

  // Audio
  windIsLoaded: false,
  stepsIsLoaded: false,
  steps2IsLoaded: false,
  jumpstartIsLoaded: false,
  jumpendIsLoaded: false,
  jumpstart2IsLoaded: false,
  jumpend2IsLoaded: false,
  shotIsLoaded: false,
  shot2IsLoaded: false,
  hitIsLoaded: false,
  hit2IsLoaded: false,
  explosionIsLoaded: false,

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

export default preloader;
