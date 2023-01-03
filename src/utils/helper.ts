// Modules Helper
/////////////////////////////////////////////

import * as THREE from 'three';

// Constants
import { Names, Textures, Audios } from '@/utils/constants';

// Types
import type {
  Texture,
  MeshStandardMaterial,
  PlaneBufferGeometry,
  BoxGeometry,
  ConeGeometry,
} from 'three';
import type { Store } from 'vuex';
import type { State } from '@/store';
import type { ISelf } from '@/models/modules';

export default class Helper {
  // Private working variables
  private _number = 0;
  private _is = false;
  private _string = '';

  // Utils
  public material: MeshStandardMaterial = new THREE.MeshStandardMaterial();
  public map!: Texture;
  public geometry!: PlaneBufferGeometry | BoxGeometry | ConeGeometry;

  // Math
  ///////////////////////////////////////////////////////////

  public randomInteger(min: number, max: number): number {
    const rand = min + Math.random() * (max + 1 - min);
    return Math.floor(rand);
  }

  public yesOrNo(): boolean {
    return Math.random() >= 0.5;
  }

  public plusOrMinus(): number {
    return Math.random() >= 0.5 ? 1 : -1;
  }

  public distance2D(x1: number, y1: number, x2: number, y2: number): number {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  }

  public damping(delta: number): number {
    return Math.exp(-3 * delta) - 1;
  }

  // Loading helpers
  ///////////////////////////////////////////////////////////

  // Помощник прелодера
  public loaderDispatchHelper(
    store: Store<State>,
    name: Names | Textures | Audios,
    isBuild = false,
  ): void {
    this._string = isBuild ? `${name}IsBuild` : `${name}IsLoaded`;
    store
      .dispatch('preloader/preloadOrBuilt', this._string)
      .then(() => {
        store.dispatch('preloader/isAllLoadedAndBuilt');
      })
      .catch((error) => {
        console.log(error);
      });
  }

  // Помощник загрузки звуков
  public setAudioToHeroHelper(self: ISelf, name: Audios): void {
    self.assets.audioLoader.load(`./audio/${name}.mp3`, (buffer) => {
      self.audio.addAudioToHero(self, buffer, name);
      this.loaderDispatchHelper(self.store, name);

      // Ветер
      if (name === Audios.wind && !self.store.getters['layout/isPause'])
        self.audio.startHeroSound(Audios.wind);
    });
  }
}
