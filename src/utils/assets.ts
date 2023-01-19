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
  private _concrette!: Texture;
  private _concrette2!: Texture;
  private _metall!: Texture;
  private _metall2!: Texture;
  private _fire!: Texture;
  private _glass!: Texture;

  // Loaders
  public GLTFLoader: GLTFLoader;
  public audioLoader: AudioLoader;
  public textureLoader: THREE.TextureLoader;

  // Audios
  public explosion!: AudioBuffer;
  public shot!: AudioBuffer;
  public steps!: AudioBuffer;
  public hit!: AudioBuffer;
  public jumpstart!: AudioBuffer;
  public jumpend!: AudioBuffer;
  public dead!: AudioBuffer;

  constructor() {
    this.GLTFLoader = new GLTFLoader();
    this.audioLoader = new THREE.AudioLoader();
    this.textureLoader = new THREE.TextureLoader();
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public init(self: ISelf) {
    // Textures
    this._concrette = self.helper.textureLoaderHelper(self, Textures.concrette);
    this._concrette2 = self.helper.textureLoaderHelper(
      self,
      Textures.concrette2,
    );
    this._metall = self.helper.textureLoaderHelper(self, Textures.metall);
    this._metall2 = self.helper.textureLoaderHelper(self, Textures.metall2);
    this._fire = self.helper.textureLoaderHelper(self, Textures.fire);
    this._glass = self.helper.textureLoaderHelper(self, Textures.glass);

    // Audio

    // Позиционированные на объектах

    this.audioLoader.load(`./audio/${Audios.explosion}.mp3`, (buffer) => {
      self.helper.loaderDispatchHelper(self.store, Audios.explosion, false);
      this.explosion = buffer;
      self.audio.initAudioByName(self, Audios.explosion);
    });

    this.audioLoader.load(`./audio/${Audios.shot}.mp3`, (buffer) => {
      self.helper.loaderDispatchHelper(self.store, Audios.shot, false);
      this.shot = buffer;
      self.audio.initAudioByName(self, Audios.shot);
    });

    this.audioLoader.load(`./audio/${Audios.steps}.mp3`, (buffer) => {
      self.helper.loaderDispatchHelper(self.store, Audios.steps, false);
      this.steps = buffer;

      self.audio.initAudioByName(self, Audios.steps);
    });

    this.audioLoader.load(`./audio/${Audios.jumpstart}.mp3`, (buffer) => {
      self.helper.loaderDispatchHelper(self.store, Audios.jumpstart, false);
      this.jumpstart = buffer;

      self.audio.initAudioByName(self, Audios.jumpstart);
    });

    this.audioLoader.load(`./audio/${Audios.jumpend}.mp3`, (buffer) => {
      self.helper.loaderDispatchHelper(self.store, Audios.jumpend, false);
      this.jumpend = buffer;

      self.audio.initAudioByName(self, Audios.jumpend);
    });

    this.audioLoader.load(`./audio/${Audios.hit}.mp3`, (buffer) => {
      self.helper.loaderDispatchHelper(self.store, Audios.hit, false);
      this.hit = buffer;

      self.audio.initAudioByName(self, Audios.hit);
    });

    this.audioLoader.load(`./audio/${Audios.dead}.mp3`, (buffer) => {
      self.helper.loaderDispatchHelper(self.store, Audios.dead, false);
      this.dead = buffer;

      self.audio.initAudioByName(self, Audios.dead);
    });

    // На герое
    self.helper.setAudioToHeroHelper(self, Audios.wind);
    self.helper.setAudioToHeroHelper(self, Audios.jumpstart, this.jumpstart);
    self.helper.setAudioToHeroHelper(self, Audios.steps, this.steps);
    self.helper.setAudioToHeroHelper(self, Audios.jumpend, this.jumpend);
    self.helper.setAudioToHeroHelper(self, Audios.shot, this.shot);
    self.helper.setAudioToHeroHelper(self, Audios.hit, this.hit);
    self.helper.setAudioToHeroHelper(self, Audios.dead, this.dead);
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
        } else if (child.name.includes(Textures.glass)) {
          child.material = self.assets.getMaterial(Textures.glass);
        } else if (child.name.includes(Textures.metallDark)) {
          child.material = self.assets.getMaterialWithColor(
            Textures.metall,
            0x222222,
          );
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
      case Textures.concrette2:
        return this._concrette2;
      case Textures.metall:
        return this._metall;
      case Textures.metall2:
        return this._metall2;
      case Textures.fire:
        return this._fire;
      case Textures.glass:
        return this._glass;
      case Textures.concrette:
      default:
        return this._concrette;
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
      case Textures.glass:
        return 16;
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
      case Textures.blood:
        return new THREE.MeshBasicMaterial({
          color: Colors.blood,
          transparent: true,
          opacity: 0,
        });
      case Textures.fire:
        return new THREE.MeshStandardMaterial({
          map: this.getTexture(name),
          color: Colors.white,
          transparent: true,
          opacity: 0,
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
      case Textures.glass:
        return new THREE.MeshPhongMaterial({
          map: this.getTexture(name),
          color: Colors.glass,
          transparent: true,
          opacity: 0.33,
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
      case Audios.jumpstart:
        return 1;
      case Audios.jumpend:
        return 0.3;
      case Audios.shot:
        return 0.8;
      case Audios.explosion:
        return 0.9;
      case Audios.hit:
        return 0.8;
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
      case Audios.shot:
        return this.shot;
      case Audios.jumpend:
        return this.jumpend;
      case Audios.steps:
        return this.steps;
      case Audios.hit:
        return this.hit;
      case Audios.dead:
        return this.dead;
    }
    return this.explosion;
  }
}
