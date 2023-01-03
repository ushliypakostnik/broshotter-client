// Constants
import { Names } from '@/utils/constants';

// Types
import type { Store } from 'vuex';
import type { State } from '@/store';
import type { Scene, AudioListener, PerspectiveCamera, Group } from 'three';
import type Helper from '@/utils/helper';
import type Assets from '@/utils/assets';
import type Events from '@/utils/events';
import type AudioBus from '@/utils/audio';
import type Octree from '@/components/Scene/World/Math/Octree';

// Interfaces
///////////////////////////////////////////////////////

export type KeysState = {
  [key: string]: boolean;
};

// Main object
export interface ISelf {
  // Utils
  helper: Helper; // "наше все" - набор рабочих функций, инкапсулирующий всю бизнес-логику и тем самым - "экономящий память" ))
  assets: Assets; // модуль собирающий все ассеты
  events: Events; // шина событий
  audio: AudioBus; // аудиомикшер

  // State
  keys: KeysState;

  // Core
  store: Store<State>;
  scene: Scene;
  camera: PerspectiveCamera;
  listener: AudioListener;
  render: () => void;
}
