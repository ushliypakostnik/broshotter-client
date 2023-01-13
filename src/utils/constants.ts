// Prohects еnums ans constants
//////////////////////////////////////////////////////

// Types
import type { TConfig, TMessages } from '@/models/utils';

// Enums

// Modules
export enum Names {
  // Modules
  audio = 'audio',
  world = 'world',
  atmosphere = 'atmosphere',
  players = 'players',
  hero = 'hero',
  enemies = 'enemies',

  // Others
  tree = 'tree',
  lenin = 'lenin',
}

export enum Modes {
  idle = 'idle',
  active = 'active',
  dead = 'dead',
}

export enum Animations {
  // Stand
  stand = 'stand',
  standforward = 'standforward',
  standback = 'standback',
  standleft = 'standleft',
  standright = 'standright',
  run = 'run',

  // Hide
  hide = 'hide',
  hideback = 'hideback',
  hideleft = 'hideleft',
  hideright = 'hideright',
  hideforward = 'hideforward',

  // Fire
  firestand = 'firestand',
  firestandforward = 'firestandforward',
  firehide = 'firehide',
  firehideforward = 'firehideforward',

  // Others
  hit = 'hit',
  jump = 'jump',
  dead = 'dead',
}

// GUI

export enum Textures {
  sky = 'sky',
  night = 'night',
  ground = 'ground',
  concrette = 'concrette',
  concrette2 = 'concrette2',
  glass = 'glass',
  glassspecial = 'glassspecial',
  metallDark = 'metallDark',
  metall = 'metall',
  metall2 = 'metall2',
  fire = 'fire',
  pseudo = 'pseudo',
  scale = 'scale',
  hole = 'hole',
}

export enum Audios {
  wind = 'wind',
  steps = 'steps',
  steps2 = 'steps2',
  jumpstart = 'jumpstart',
  jumpend = 'jumpend',
  jumpstart2 = 'jumpstart2',
  jumpend2 = 'jumpend2',
  shot = 'shot',
  shot2 = 'shot2',
  hit = 'hit',
  hit2 = 'hit2',
  explosion = 'explosion',
  dead = 'dead',
  dead2 = 'dead2',
}

export enum Colors {
  white = 0xffffff,
  black = 0x000000,
  yellow = 0xfed564,
  yellowDark = 0xe6a800,

  fog = 0xa48ed8,

  sun = 0xfdb813,
  toruch = 0xffff99,
  sky = 0x77deac,
  metall = 0x999999,
  metall2 = 0xee99aa,
  fire = 0xff6666,
  scale = 0x681a13,
  glass = 0xaaaaaa,
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

// Конфиг
export const DESIGN: TConfig = {
  V: '1.0.0',
  BREAKPOINTS: Breakpoints,
  SIZE: 300,
  CAMERA: {
    fov: 80,
    fog: Colors.fog,
  },
  HIT_TIMEOUT: 500, // ms
  MESSAGES_TIMEOUT: 3000, // ms
  DEFAULT_VOLUME: 0.3,
  GAMEPLAY: {
    PLAYER_SPEED: 30,
    PLAYER_HEIGHT: 2,
    JUMP: 20,
    GRAVITY: 40,
    SHOTS: 50,
    START: {
      positionX: 0,
      positionY: 30,
      positionZ: 0,
      directionX: 0.7,
      directionY: 0,
      directionZ: 0.7,
    },
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

// Переводы

export const MESSAGES: TMessages = {
  [Languages.en]: {
    enter: 'Enter',
    name: 'BroShotter',
    nick: 'Your nickname:',
    nick2: '(Only latin)',
    gadgetsgate: 'The game is for desktop browsers only!',
    chromegate:
      'In order to play, open in the Google Chrome (or Yandex) browser (Firefox not recommended)',
    startbutton: 'Play',
    restartbutton: 'Restart',

    control1: 'Shot: Left mouse button',
    control2: 'Move: WASD',
    control3: 'Jump: Space + WASD',
    control4: 'Run: Shift + W',
    control5: 'Hidden movement: C or Alt',
    control6: 'Look: Mouse',
    // control7: 'Take a thing / Open door : E',
    control8: 'Optical sight: Right mouse button',
    control9: 'Menu: P',

    copyright: '© Levon Gambaryan Bro Games',

    hiddenMoveEnabled: 'You move in stealth mode',
    hiddenMoveDisabled: 'Stealth mode disabled',
    tired: 'Your is tired of running',
    recovered: 'Your can run again',

    gameover: 'Game Over',
  },
  [Languages.ru]: {
    enter: 'Играть',
    nick: 'Тебя зовут:',
    nick2: '(Только латиницей, к сожалению)',
    name: 'BroShotter',
    gadgetsgate: 'Игра только для десктопных браузеров!',
    chromegate:
      'Для того чтобы играть откройте в браузере Google Chrome (или Яндекс), Firefox не рекомендуется',
    startbutton: 'Играть',
    restartbutton: 'Cначала',

    control1: 'Выстрел: Левая кнопка мыши',
    control2: 'Движение: WASD',
    control3: 'Прыжок: Space + WASD',
    control4: 'Бежать: Shift + W',
    control5: 'Cкрытное передвижение (меньше урон): C или Alt',
    control6: 'Осмотреться: Мышь',
    // control7: 'Взять предмет / Открыть дверь: Е',
    control8: 'Оптический прицел: Правая кнопка мыши',
    control9: 'Меню: P',

    copyright: '© Levon Gambaryan Bro Games',

    hiddenMoveEnabled: 'Вы двигаетесь в скрытном режиме',
    hiddenMoveDisabled: 'Скрытный режим отключен',
    tired: 'Вы устали от бега',
    recovered: 'Вы снова можете бегать',

    gameover: 'Проиграл',
  },
};
