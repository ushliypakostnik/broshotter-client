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
import type { TPosition, TPositions } from '@/models/utils';

export default class Helper {
  // Private working variables
  private _number = 0;
  private _is = false;
  private _string = '';

  // Loaders
  public textureLoader: THREE.TextureLoader;

  // Utils
  public material: MeshStandardMaterial = new THREE.MeshStandardMaterial();
  public map!: Texture;
  public geometry!: PlaneBufferGeometry | BoxGeometry | ConeGeometry;

  constructor() {
    this.textureLoader = new THREE.TextureLoader();
  }

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

  public degreesToRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  public radiansToDegrees(radians: number): number {
    return radians * (180 / Math.PI);
  }

  public damping(delta: number): number {
    return Math.exp(-3 * delta) - 1;
  }

  public getRandomPosition(
    centerX: number,
    centerZ: number,
    radius: number,
    isSafeCenter: boolean,
  ): TPosition {
    const safe = isSafeCenter ? 16 : 8;
    const a = this.plusOrMinus();
    const b = this.plusOrMinus();
    return {
      x: Math.round(centerX + Math.random() * a * radius) + safe * a,
      z: Math.round(centerZ + Math.random() * b * radius) + safe * b,
    };
  }

  private _isBadPosition(
    positions: TPositions,
    position: TPosition,
    distance: number,
  ): boolean {
    return !!positions.find(
      (place: TPosition) =>
        this.distance2D(place.x, place.z, position.x, position.z) < distance,
    );
  }

  public getUniqueRandomPosition(
    positions: TPositions,
    centerX: number,
    centerZ: number,
    distance: number,
    radius: number,
    isSafeCenter: boolean,
  ): TPosition {
    let position: TPosition = this.getRandomPosition(
      centerX,
      centerZ,
      radius,
      isSafeCenter,
    );
    while (this._isBadPosition(positions, position, distance)) {
      position = this.getRandomPosition(centerX, centerZ, radius, isSafeCenter);
    }
    return position;
  }

  // Loading helpers
  ///////////////////////////////////////////////////////////

  // Помощник загрузки текстур
  public textureLoaderHelper(self: ISelf, name: Textures): Texture {
    let path: string;
    let folder: string;
    let number = 0;
    // Папка
    switch (name) {
      case Textures.sky:
        folder = 'sky';
        number = self.helper.randomInteger(1, 9);
        break;
      case Textures.ground:
        folder = 'ground';
        number = self.helper.randomInteger(1, 12);
        break;
      case Textures.concrette:
      case Textures.concrette2:
      case Textures.metall:
      case Textures.metall2:
      case Textures.fire:
      case Textures.asphalt:
      default:
        folder = 'material';
        break;
    }

    if (number) path = `./images/textures/${folder}/${name}${number}.jpg`;
    else path = `./images/textures/${folder}/${name}.jpg`;

    return this.textureLoader.load(
      path,
      (map: Texture) => {
        this._number = self.assets.getRepeatByName(name);
        map.repeat.set(this._number, this._number);
        map.wrapS = map.wrapT = THREE.RepeatWrapping;
        map.encoding = THREE.sRGBEncoding;

        self.render();
        this.loaderDispatchHelper(self.store, name);

        return map;
      },
    );
  }

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
        store.dispatch('preloader/isAllLoadedAndBuild');
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
      if (name === Audios.wind) self.audio.startHeroSound(Audios.wind);
    });
  }
}
