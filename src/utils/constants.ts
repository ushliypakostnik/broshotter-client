// Prohects еnums ans constants
//////////////////////////////////////////////////////

// Types
import type { TConfig, TMessages } from '@/models/utils';

// Enums

// Modules
export enum Names {
  // Modules
  world = 'world',

  // Static
  atmosphere = 'atmosphere',

  players = 'players',
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
  sky = 'sky',
  sand = 'sand',
  ground = 'ground',
  concrette = 'concrette',
  glassspecial = 'glassspecial',
  metall = 'metall',
  fire = 'fire',
}

export enum Audios {
  wind = 'wind',
  steps = 'steps',
  jumpstart = 'jumpstart',
  jumpend = 'jumpend',
  shot = 'shot',
  hit = 'hit',
}

export enum Colors {
  white = 0xffffff,
  black = 0x000000,
  yellow = 0xfed564,

  sun = 0xffff99,
  sky = 0x77deac,
  ground = 0xffffff,
  concrette = 0xfedeaa,
  glassspecial = 0xffffff,
  metall = 0x666666,
  fire = 0xff6666,
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
export const GROUND = 1500;
export const size = (size: number): number => {
  return size * GROUND;
};

// Конфиг
export const DESIGN: TConfig = {
  V: '1.0.0',
  BREAKPOINTS: Breakpoints,
  SIZE: size(1),
  CAMERA: {
    fov: 80,
    fog: 0xa48ed8,
  },
  MESSAGES_TIMEOUT: 3000, // ms
  DEFAULT_VOLUME: 0.3,
  GAMEPLAY: {
    PLAYER_SPEED: 30,
    PLAYER_HEIGHT: 2,
    JUMP: 15,
    GRAVITY: 40,
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

    hiddenMoveEnabled: 'You move in stealth mode',
    hiddenMoveDisabled: 'Stealth mode disabled',
    tired: 'Your is tired of running',
    recovered: 'Your can run again',
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

    hiddenMoveEnabled: 'Вы двигаетесь в скрытном режиме',
    hiddenMoveDisabled: 'Скрытный режим отключен',
    tired: 'Вы устали от бега',
    recovered: 'Вы снова можете бегать',
  },
};
