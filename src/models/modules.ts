// Constants
import { Names } from '@/utils/constants';

// Types
import type { Store } from 'vuex';
import type { State } from '@/store';
import type { Scene, AudioListener } from 'three';
import type Helper from '@/utils/helper';
import type Assets from '@/utils/assets';
import type Events from '@/utils/events';
import type AudioBus from '@/utils/audio';

// Interfaces
///////////////////////////////////////////////////////

// Main object
export interface ISelf {
  // Utils
  helper: Helper; // "наше все" - набор рабочих функций, инкапсулирующий всю бизнес-логику и тем самым - "экономящий память" ))
  assets: Assets; // модуль собирающий все ассеты
  events: Events; // шина событий
  audio: AudioBus; // аудиомикшер

  // Core
  store: Store<State>;
  scene: Scene;
  listener: AudioListener;
  render: () => void;
}

// Статичный модуль без копий - например Атмосфера
export interface IStaticModule {
  init(self: ISelf): void;
}

// Aнимированные модули
export interface IAnimatedModule extends IStaticModule {
  animate(self: ISelf): void;
}

// Abstract
///////////////////////////////////////////////////////

// Статичный модуль - например Атмосфера
export abstract class StaticModule implements IStaticModule {
  constructor(public name: Names) {
    this.name = name;
  }

  // Инициализация
  public abstract init(self: ISelf): void;
}

// Анимированные модули - например сам Мир
export abstract class AnimatedModule implements IAnimatedModule {
  constructor(public name: Names) {
    this.name = name;
  }

  // Инициализация
  public abstract init(self: ISelf): void;

  // Анимация
  public abstract animate(self: ISelf): void;
}
