// Assets Helper
//////////////////////////////////////////////////////

import * as THREE from 'three';

// Constants
import { Textures, Colors, Audios, DESIGN } from '@/utils/constants';

// Types
import type { ISelf } from '@/models/modules';
import type {
  Texture,
  AudioLoader,
  MeshPhongMaterial,
  MeshBasicMaterial,
  MeshStandardMaterial,
} from 'three';

// Modules
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

export default class Assets {
  // Textures
  private _sand!: Texture;
  private _ground!: Texture;
  private _concrette!: Texture;
  private _metall!: Texture;
  private _sky!: Texture;
  private _fire!: Texture;

  // Loaders
  public GLTFLoader: GLTFLoader;
  public audioLoader: AudioLoader;
  public textureLoader: THREE.TextureLoader;

  // Audios
  public explosion!: AudioBuffer;

  constructor() {
    this.GLTFLoader = new GLTFLoader();
    this.audioLoader = new THREE.AudioLoader();
    this.textureLoader = new THREE.TextureLoader();
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public init(self: ISelf) {
    // Textures
    this._sand = self.helper.textureLoaderHelper(self, Textures.sand);
    this._ground = self.helper.textureLoaderHelper(self, Textures.ground);
    this._concrette = self.helper.textureLoaderHelper(self, Textures.concrette);
    this._concrette = self.helper.textureLoaderHelper(self, Textures.concrette);
    this._sky = self.helper.textureLoaderHelper(self, Textures.sky);
    this._metall = self.helper.textureLoaderHelper(self, Textures.metall);
    this._fire = self.helper.textureLoaderHelper(self, Textures.fire);

    // Audio
    self.helper.setAudioToHeroHelper(self, Audios.wind);
    self.helper.setAudioToHeroHelper(self, Audios.steps);
    self.helper.setAudioToHeroHelper(self, Audios.jumpstart);
    self.helper.setAudioToHeroHelper(self, Audios.jumpend);
    self.helper.setAudioToHeroHelper(self, Audios.shot);
    self.helper.setAudioToHeroHelper(self, Audios.hit);


    this.audioLoader.load(`./audio/${Audios.explosion}.mp3`, (buffer) => {
      self.helper.loaderDispatchHelper(
        self.store,
        Audios.explosion,
        false,
      );
      this.explosion = buffer;
      self.audio.initAudioByName(self, Audios.explosion);
    });
  }

  // Texture utils

  public traverseHelper(self: ISelf, model: GLTF): GLTF {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    model.scene.traverse((child: any) => {
      if (child.isMesh) {
        if (child.name.includes(Textures.ground)) {
          child.material = self.assets.getMaterial(Textures.ground);
        } else if (child.name.includes(Textures.concrette)) {
          child.material = self.assets.getMaterial(Textures.concrette);
        } else if (child.name.includes(Textures.glassspecial)) {
          child.material = self.assets.getMaterial(Textures.glassspecial);
        } else if (child.name.includes(Textures.metall)) {
          child.material = self.assets.getMaterial(Textures.metall);
        } else if (child.name.includes(Textures.fire)) {
          child.material = self.assets.getMaterial(Textures.fire);
        }
      }
    });
    return model;
  }

  // Получить текстуру
  public getTexture(name: Textures): Texture {
    switch (name) {
      case Textures.sky:
        return this._sky;
      case Textures.ground:
        return this._ground;
      case Textures.concrette:
        return this._concrette;
      case Textures.metall:
        return this._metall;
      case Textures.fire:
        return this._fire;
      case Textures.sand:
      default:
        return this._sand;
    }
  }

  // Повторения текстуры по имени
  public getRepeatByName(name: Textures): number {
    switch (name) {
      case Textures.sand:
        return 256;
      case Textures.ground:
      case Textures.concrette:
        return 8;
      case Textures.metall:
        return 2;
      case Textures.fire:
        return 4;
    }
    return 2;
  }

  // Получить материал
  public getMaterialWithColor(
    name: Textures,
    color: Colors,
  ): MeshPhongMaterial | MeshBasicMaterial | MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({
      map: this.getTexture(name),
      color,
    });
  }

  // Получить материал
  public getMaterial(
    name: Textures,
  ): MeshPhongMaterial | MeshBasicMaterial | MeshStandardMaterial {
    switch (name) {
      case Textures.pseudo:
        return new THREE.MeshStandardMaterial({
          transparent: true,
          opacity: 0.5,
          color: Colors.scale,
          side: THREE.DoubleSide,
        });
      case Textures.scale:
        return new THREE.MeshStandardMaterial({
          color: Colors.scale,
          transparent: true,
          opacity: 0.5,
        });
      case Textures.hole:
        return new THREE.MeshStandardMaterial({
          color: Colors.black,
        });
      case Textures.sand:
        return new THREE.MeshStandardMaterial({
          map: this.getTexture(name),
          color: Colors.yellowDark,
        });
      case Textures.sky:
        return new THREE.MeshBasicMaterial({
          map: this.getTexture(name),
          color: Colors.sky,
        });
      case Textures.ground:
        return new THREE.MeshStandardMaterial({
          map: this.getTexture(name),
          color: Colors.ground,
        });
      case Textures.fire:
        return new THREE.MeshStandardMaterial({
          map: this.getTexture(name),
          color: Colors.white,
        });
      case Textures.concrette:
        return new THREE.MeshPhongMaterial({
          map: this.getTexture(name),
          color: Colors.concrette,
        });
      case Textures.glassspecial:
        return new THREE.MeshStandardMaterial({
          color: Colors.glassspecial,
          transparent: true,
          opacity: 0.25,
        });
      case Textures.metall:
        return new THREE.MeshStandardMaterial({
          map: this.getTexture(name),
          color: Colors.metall,
        });
    }
    return new THREE.MeshPhongMaterial({
      map: this.getTexture(name),
      color: Colors[name as unknown as keyof typeof Colors],
    });
  }

  // Audio utils
  // Получить громкость по имени
  public getVolumeByName(name: Audios): number {
    switch (name) {
      case Audios.wind:
        return 0.3;
      case Audios.steps:
        return 0.3;
      case Audios.jumpstart:
        return 1;
      case Audios.jumpend:
        return 0.4;
      case Audios.shot:
        return 0.25;
      case Audios.explosion:
        return 0.9;
      case Audios.hit:
        return 0.8;
    }
    return DESIGN.DEFAULT_VOLUME;
  }

  // Получить звук
  public getAudio(name: Audios): AudioBuffer {
    // console.log('Assets getAudio', name);
    return this.explosion;
  }

  // Аудио по имени
  /*
  public getAudioByName(name: Names): Audios {
    return Audios[name as keyof typeof Audios];
  }
  */
}
