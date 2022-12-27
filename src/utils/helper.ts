// Modules Helper
//////////////////////////////////////////////////////

import * as THREE from 'three';

// Constants
import { Names, Textures, Audios } from '@/utils/constants';

// Types
import {
  Texture,
  MeshStandardMaterial,
  PlaneBufferGeometry,
  BoxGeometry,
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
  public geometry!: PlaneBufferGeometry | BoxGeometry;

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

  // Помощник загрузки и установки текстур
  public setMapHelper(self: ISelf, name: Textures): Texture {
    this._number = self.assets.getRepeatByName(name);
    this.map = self.assets.textureLoader.load(
      `./images/textures/${name}.jpg`,
      () => {
        self.render();
        this.loaderDispatchHelper(self.store, name);
      },
    );
    this.map.repeat.set(this._number, this._number);
    this.map.wrapS = this.map.wrapT = THREE.RepeatWrapping;
    this.map.encoding = THREE.sRGBEncoding;

    return this.map;
  }

  // Помощник загрузки звуков
  public setAudioToHeroHelper(self: ISelf, name: Audios): void {
    self.assets.audioLoader.load(`./audio/${name}.mp3`, (buffer) => {
      self.audio.addAudioToHero(self, buffer, name);
      this.loaderDispatchHelper(self.store, name);

      // Ветер
      if (name === Audios.wind) {
        if (!self.store.getters['layout/isPause']) {
          /* self.listener.context.resume().then(() => {
            console.log('Playback resumed successfully');
          }); */
          self.audio.startHeroSound(Audios.wind);
        }
      }
    });
  }

  /*
  public traverseHelper(self: ISelf, model: GLTF, name: Names): GLTF {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    model.scene.traverse((child: any) => {
      if (child.isMesh) {
        if (child.name.includes(Textures.concrette)) {
          child.material = self.assets.getMaterial(Textures.concrette);
        } else if (child.name.includes(Textures.metall2)) {
          child.material = self.assets.getMaterial(Textures.metall2);
        } else if (child.name.includes(Textures.metall)) {
          child.material = self.assets.getMaterial(Textures.metall);
        } else if (child.name.includes(Textures.glass)) {
          child.material = self.assets.getMaterial(Textures.glass);
        } else if (child.name.includes(Textures.hole)) {
          child.material = self.assets.getMaterial(Textures.hole);
        } else if (child.name.includes(Textures.player)) {
          child.material = self.assets.getMaterial(Textures.player);
        }
      }
    });

    return model;
  } */
}
