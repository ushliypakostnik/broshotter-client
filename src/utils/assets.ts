// Assets Helper
//////////////////////////////////////////////////////

import * as THREE from 'three';

// Constants
import { Names, Textures, Audios, DESIGN } from '@/utils/constants';

// Types
import type { ISelf } from '@/models/modules';
import type { Texture, AudioLoader } from 'three';

// Modules
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

export default class Assets {
  // Textures
  private _sand!: Texture;

  // Loaders
  public GLTFLoader: GLTFLoader;
  public audioLoader: AudioLoader;
  public textureLoader: THREE.TextureLoader;

  // Audios
  private _plants!: AudioBuffer; // пример

  constructor() {
    this.GLTFLoader = new GLTFLoader();
    this.audioLoader = new THREE.AudioLoader();
    this.textureLoader = new THREE.TextureLoader();
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public init(self: ISelf) {
    // Textures
    this._sand = self.helper.setMapHelper(self, Textures.sand);

    // Audio
    self.helper.setAudioToHeroHelper(self, Audios.wind);

    // пример
    /*
    this.audioLoader.load(`./audio/${Audios.plants}.mp3`, (buffer) => {
      self.helper.loaderDispatchHelper(
        self.store,
        `${Audios.plants}AudioIsLoaded`,
      );
      this._plants = buffer;
      self.audio.initAudioByName(self, Audios.plants);
    }); */
  }

  // Texture utils

  // Текстура по имени
  private _getTextureByName(name: Names): Textures {
    switch (name) {
      case Names.sand:
        return Textures.sand;
    }
    return Textures.sand;
  }

  // Получить текстуру
  public getTexture(name: Names | Textures): Texture {
    const n = name in Names ? this._getTextureByName(name as Names) : name;
    switch (n) {
      case Textures.sand:
      default:
        return this._sand;
    }
  }

  // Повторения текстуры по имени
  public getRepeatByName(name: Names | Textures): number {
    switch (name) {
      case Names.sand:
        return 2048;
    }
    return 2;
  }

  // Audio utils

  // Получить звук
  public getAudio(name: Audios): AudioBuffer {
    console.log('getAudio', name);
    return this._plants; // пример
  }

  // Громкость по имени
  public getVolumeByName(name: Audios): number {
    return DESIGN.VOLUME[name];
  }

  // Аудио по имени
  /*
  public getAudioByName(name: Names): Audios => {
    return Audios[name as keyof typeof Audios];
  }
  */
}
