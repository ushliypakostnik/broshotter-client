// Prohects еnums ans constants
//////////////////////////////////////////////////////

// Types
import type { TConfig, TMessages } from '@/models/utils';

// Enums

// Modules
export enum Names {
  // Modules
  world = 'world',
  atmosphere = 'atmosphere',
  hero = 'hero',
  enemies = 'enemies',

  // Others
  sand = 'sand',
}

export enum Modes {
  idle = 'idle',
  active = 'active',
  dead = 'dead',
}

export enum Motions {
  // Idle mode
  idle = 'idle',
  sad = 'sad',
  guitar = 'guitar',

  // Active mode
  // Stand
  standdisturbed = 'standdisturbed',
  standwalking = 'standwalking',
  standbackwalking = 'standbackwalking',
  run = 'run',

  // Hide
  hidedisturbed = 'hidedisturbed',
  hidewalking = 'hidewalking',
  hidebackwalking = 'hidebackwalking',

  // Fire
  firedisturbed = 'firedisturbed',
  firewalking = 'firewalking',
  firerun = 'firerun',
  firehidedisturbed = 'firehidedisturbed',
  firehidewalking = 'firehidewalking',

  // Others
  hit = 'hit',
  jump = 'jump',
  dead = 'dead',
}

// GUI

export enum Textures {
  sand = 'sand',
}

export enum Audios {
  wind = 'wind',
}

export enum Colors {
  white = 0xffffff,
  black = 0x000000,
  blue = 0x77aaff,
  yellow = 0xfed564,
}

enum Breakpoints {
  desktop = 1025,
}

enum Languages {
  en = 'en',
  ru = 'ru',
}

// Configuration

const isProd = process.env.NODE_ENV === 'production';
const apiUrl = process.env.VUE_APP_API_URL;
export const API_URL = isProd
  ? apiUrl || '//api.robot-game.ru'
  : apiUrl || 'http://localhost:3000';

export const LANGUAGES: string[] = [Languages.en, Languages.ru];

// Тут главный размер, относительно которого все по ширине,
// кроме того что должно быть адекватным росту по высоте
export const GROUND = 4000;
export const size = (size: number): number => {
  return size * GROUND;
};

// Конфиг
export const DESIGN: TConfig = {
  V: '1.0.0',
  BREAKPOINTS: Breakpoints,
  SIZE: size(1),
  CAMERA: {
    fov: 70,
    fog: 0xa48ed8,
  },
  MESSAGES_TIMEOUT: 3000, // ms
  VOLUME: {
    [Audios.wind]: 0.3,
  },
};

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

// Все объекты

// Префикс псевдообъектов
export const PSEUDO = 'pseudo/';

// Части моделей
export const CHILD = 'child/';

export const OBJECTS: TConfig = {
  [Names.sand]: {
    radius: size(0.5),
    positionY: 0,
  },
};

// Переводы

export const MESSAGES: TMessages = {
  [Languages.en]: {
    enter: 'Enter',
    nick: 'Your nickname:',
    name: 'BroShotter',
    gadgetsgate: 'The game is for desktop browsers only!',
    chromegate:
      'In order to play, open in the Google Chrome (or Yandex) browser (Firefox not recommended)',
    startbutton: 'Play',
    key1: 'Ecs - pause',
    copyright: '© Levon Gambaryan Bro Games',
  },
  [Languages.ru]: {
    enter: 'Играть',
    nick: 'Тебя зовут:',
    name: 'BroShotter',
    gadgetsgate: 'Игра только для десктопных браузеров!',
    chromegate:
      'Для того чтобы играть откройте в браузере Google Chrome (или Яндекс), Firefox не рекомендуется',
    startbutton: 'Играть',
    key1: 'Ecs - пауза',
    copyright: '© Levon Gambaryan Bro Games',
  },
};
