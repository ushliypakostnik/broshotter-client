// Prohects еnums ans constants
//////////////////////////////////////////////////////

// Types
import type { TConfig, TMessages } from '@/models/utils';

// Enums

// Modules
export enum Names {
  world = 'world',
  atmosphere = 'atmosphere',
  sand = 'sand',
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
  blue = 0x88ccff,
  yellow = 0xfed564,
  yellowLight = 0xffe064,
  dark = 0x13334c,
}

enum Breakpoints {
  desktop = 1025,
}

enum Languages {
  en = 'en',
  ru = 'ru',
}

// Configuration

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
  CELL: 20,
  CAMERA: {
    fov: 70,
    fog: 0xa48ed8,
  },
  MESSAGES_TIMEOUT: 3000, // ms
  VOLUME: {
    [Audios.wind]: 0.1,
  },
};

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
    name: 'Three',
    gadgetsgate: 'The game is for desktop browsers only!',
    chromegate:
      'In order to play, open in the Google Chrome (or Yandex) browser (Firefox not recommended)',
    startbutton: 'Play',
    restartbutton: 'Start over',
    key1: 'Ecs - pause',
    copyright: '© Levon Gambaryan Bro Games',
  },
  [Languages.ru]: {
    name: 'Three',
    gadgetsgate: 'Игра только для десктопных браузеров!',
    chromegate:
      'Для того чтобы играть откройте в браузере Google Chrome (или Яндекс), Firefox не рекомендуется',
    startbutton: 'Играть',
    restartbutton: 'Начать сначала',
    key1: 'Ecs - пауза',
    copyright: '© Levon Gambaryan Bro Games',
  },
};
