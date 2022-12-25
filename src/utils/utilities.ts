// Useful functions
//////////////////////////////////////////////////////

// Constants
import { Names, Textures, Audios, DESIGN } from '@/utils/constants';

// Types
import type { Store } from 'vuex';
import type { State } from '@/store';

// Math

export const yesOrNo = (): boolean => Math.random() >= 0.5;

export const plusOrMinus = (): number => {
  return Math.random() >= 0.5 ? 1 : -1;
};

export const randomInteger = (min: number, max: number): number => {
  const rand = min + Math.random() * (max + 1 - min);
  return Math.floor(rand);
};

export const distance2D = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): number => {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
};

// THREE

// Текстура по имени
export const getTextureByName = (name: Names): Textures => {
  switch (name) {
    case Names.sand:
      return Textures.sand;
  }
  return Textures.sand;
};

// Повторения текстуры по имени
export const getRepeatByName = (name: Names | Textures): number => {
  switch (name) {
    case Names.sand:
      return 512;
  }
  return 2;
};

// Громкость по имени
export const getVolumeByName = (name: Audios): number => {
  return DESIGN.VOLUME[name];
};

// Узнать закольцован ли звук по имени
export const getIsLoopByName = (name: Audios): boolean => {
  switch (name) {
    case Audios.wind:
      return true;
    default:
      return false;
  }
};

// Аудио по имени
/*
export const getAudioByName = (name: Names): Audios => {
  return Audios[name as keyof typeof Audios];
};
*/

// Layout

// Экранный помощник
export const ScreenHelper = (() => {
  const DESKTOP = DESIGN.BREAKPOINTS.desktop;

  const isDesktop = () => {
    return window.matchMedia(`(min-width: ${DESKTOP}px)`).matches;
  };

  const isBro = () => {
    const isChrome =
      /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
    const isYandex = navigator.userAgent.search(/YaBrowser/) > 0;
    const isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
    return isChrome || isYandex || isFirefox;
  };

  return {
    isDesktop,
    isBro,
  };
})();

// Помощник перезагрузки
export const restartDispatchHelper = (store: Store<State>): void => {
  store
    .dispatch('layout/setField', {
      field: 'isReload',
      value: true,
    })
    .then(() => {
      store
        .dispatch('layout/reload')
        .then(() => {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          window.location.reload(true);
        })
        .catch((error) => {
          console.log(error);
        });
    })
    .catch((error) => {
      console.log(error);
    });
};
