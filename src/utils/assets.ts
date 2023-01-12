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
  private _ground!: Texture;
  private _concrette!: Texture;
  private _concrette2!: Texture;
  private _metall!: Texture;
  private _metall2!: Texture;
  private _sky!: Texture;
  private _night!: Texture;
  private _fire!: Texture;

  // Loaders
  public GLTFLoader: GLTFLoader;
  public audioLoader: AudioLoader;
  public textureLoader: THREE.TextureLoader;

  // Audios
  public explosion!: AudioBuffer;
  public shot2!: AudioBuffer;
  public steps2!: AudioBuffer;
  public hit2!: AudioBuffer;
  public jumpstart2!: AudioBuffer;
  public jumpend2!: AudioBuffer;
  public dead!: AudioBuffer;

  constructor() {
    this.GLTFLoader = new GLTFLoader();
    this.audioLoader = new THREE.AudioLoader();
    this.textureLoader = new THREE.TextureLoader();
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public init(self: ISelf) {
    // Textures
    this._ground = self.helper.textureLoaderHelper(self, Textures.ground);
    this._concrette = self.helper.textureLoaderHelper(self, Textures.concrette);
    this._concrette2 = self.helper.textureLoaderHelper(
      self,
      Textures.concrette2,
    );
    this._sky = self.helper.textureLoaderHelper(self, Textures.sky);
    this._night = self.helper.textureLoaderHelper(self, Textures.night);
    this._metall = self.helper.textureLoaderHelper(self, Textures.metall);
    this._metall2 = self.helper.textureLoaderHelper(self, Textures.metall2);
    this._fire = self.helper.textureLoaderHelper(self, Textures.fire);

    // Audio
    // На герое
    self.helper.setAudioToHeroHelper(self, Audios.wind);
    self.helper.setAudioToHeroHelper(self, Audios.steps);
    self.helper.setAudioToHeroHelper(self, Audios.jumpstart);
    self.helper.setAudioToHeroHelper(self, Audios.jumpend);
    self.helper.setAudioToHeroHelper(self, Audios.shot);
    self.helper.setAudioToHeroHelper(self, Audios.hit);

    // Позиционированные на объектах
    this.audioLoader.load(`./audio/${Audios.explosion}.mp3`, (buffer) => {
      self.helper.loaderDispatchHelper(self.store, Audios.explosion, false);
      this.explosion = buffer;
      self.audio.initAudioByName(self, Audios.explosion);
    });

    this.audioLoader.load(`./audio/${Audios.shot2}.mp3`, (buffer) => {
      self.helper.loaderDispatchHelper(self.store, Audios.shot2, false);
      this.shot2 = buffer;
      self.audio.initAudioByName(self, Audios.shot2);
    });

    this.audioLoader.load(`./audio/${Audios.steps2}.mp3`, (buffer) => {
      self.helper.loaderDispatchHelper(self.store, Audios.steps2, false);
      this.steps2 = buffer;

      self.audio.initAudioByName(self, Audios.steps2);
    });

    this.audioLoader.load(`./audio/${Audios.jumpstart2}.mp3`, (buffer) => {
      self.helper.loaderDispatchHelper(self.store, Audios.jumpstart2, false);
      this.jumpstart2 = buffer;

      self.audio.initAudioByName(self, Audios.jumpstart2);
    });

    this.audioLoader.load(`./audio/${Audios.jumpend2}.mp3`, (buffer) => {
      self.helper.loaderDispatchHelper(self.store, Audios.jumpend2, false);
      this.jumpend2 = buffer;

      self.audio.initAudioByName(self, Audios.jumpend2);
    });

    this.audioLoader.load(`./audio/${Audios.hit2}.mp3`, (buffer) => {
      self.helper.loaderDispatchHelper(self.store, Audios.hit2, false);
      this.hit2 = buffer;

      self.audio.initAudioByName(self, Audios.hit2);
    });

    this.audioLoader.load(`./audio/${Audios.dead}.mp3`, (buffer) => {
      self.helper.loaderDispatchHelper(self.store, Audios.dead, false);
      this.dead = buffer;

      self.audio.initAudioByName(self, Audios.dead);
    });
  }

  // Texture utils

  public traverseHelper(self: ISelf, model: GLTF): GLTF {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    model.scene.traverse((child: any) => {
      if (child.isMesh) {
        if (child.name.includes(Textures.concrette2)) {
          child.material = self.assets.getMaterial(Textures.concrette2);
        } else if (child.name.includes(Textures.concrette)) {
          child.material = self.assets.getMaterial(Textures.concrette);
        } else if (child.name.includes(Textures.glassspecial)) {
          child.material = self.assets.getMaterial(Textures.glassspecial);
        } else if (child.name.includes(Textures.metall2)) {
          child.material = self.assets.getMaterial(Textures.metall2);
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
      case Textures.night:
        return this._night;
      case Textures.concrette:
        return this._concrette;
      case Textures.concrette2:
        return this._concrette2;
      case Textures.metall:
        return this._metall;
      case Textures.metall2:
        return this._metall2;
      case Textures.fire:
        return this._fire;
      case Textures.ground:
      default:
        return this._ground;
    }
  }

  // Повторения текстуры по имени
  public getRepeatByName(name: Textures): number {
    switch (name) {
      case Textures.ground:
        return 256;
      case Textures.concrette:
      case Textures.concrette2:
        return 8;
      case Textures.metall:
      case Textures.metall2:
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
    name: Textures
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
      case Textures.ground:
        return new THREE.MeshStandardMaterial({
          map: this.getTexture(name),
          color: Colors.yellowDark,
        });
      case Textures.sky:
      case Textures.night:
        return new THREE.MeshBasicMaterial({
          map: this.getTexture(name),
          color: Colors.sky,
        });
      case Textures.fire:
        return new THREE.MeshStandardMaterial({
          map: this.getTexture(name),
          color: Colors.white,
        });
      case Textures.concrette:
        return new THREE.MeshPhongMaterial({
          map: this.getTexture(name),
          color: Colors.white,
        });
      case Textures.concrette2:
        return new THREE.MeshStandardMaterial({
          map: this.getTexture(name),
          color: Colors.white,
        });
      case Textures.glassspecial:
        return new THREE.MeshStandardMaterial({
          color: Colors.white,
          transparent: true,
          opacity: 0.25,
        });
      case Textures.metall:
        return new THREE.MeshStandardMaterial({
          map: this.getTexture(name),
          color: Colors.metall,
        });
      case Textures.metall2:
        return new THREE.MeshStandardMaterial({
          map: this.getTexture(name),
          color: Colors.metall2,
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
      case Audios.steps2:
        return 0.4;
      case Audios.jumpstart:
      case Audios.jumpstart2:
        return 1;
      case Audios.jumpend:
        return 0.3;
      case Audios.jumpend2:
        return 0.4;
      case Audios.shot:
        return 0.8;
      case Audios.shot2:
        return 0.8;
      case Audios.explosion:
        return 0.9;
      case Audios.hit:
        return 0.15;
      case Audios.hit2:
        return 0.25;
      case Audios.dead:
        return 0.7;
    }
    return DESIGN.DEFAULT_VOLUME;
  }

  // Получить звук
  public getAudio(name: Audios): AudioBuffer {
    // console.log('Assets getAudio', name);
    switch (name) {
      case Audios.explosion:
        return this.explosion;
      case Audios.shot2:
        return this.shot2;
      case Audios.jumpstart2:
        return this.jumpstart2;
      case Audios.jumpend2:
        return this.jumpend2;
      case Audios.steps2:
        return this.steps2;
      case Audios.hit2:
        return this.hit2;
      case Audios.dead:
        return this.dead;
    }
    return this.explosion;
  }
}
