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
  private _number!: number;

  // Textures
  private _sand!: Texture;
  private _ground!: Texture;
  private _concrette!: Texture;
  private _metall!: Texture;
  public sky!: Texture;

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

    this.textureLoader.load(`./images/textures/${Textures.sand}.jpg`, (map) => {
      this._number = this.getRepeatByName(Textures.sand);
      map.repeat.set(this._number, this._number);
      map.wrapS = map.wrapT = THREE.RepeatWrapping;
      map.encoding = THREE.sRGBEncoding;
      this._sand = map;
      // self.render();
      self.helper.loaderDispatchHelper(self.store, Textures.sand);
    });

    this.textureLoader.load(
      `./images/textures/${Textures.ground}.jpg`,
      (map) => {
        this._number = this.getRepeatByName(Textures.ground);
        map.repeat.set(this._number, this._number);
        map.wrapS = map.wrapT = THREE.RepeatWrapping;
        map.encoding = THREE.sRGBEncoding;
        this._ground = map;
        // self.render();
        self.helper.loaderDispatchHelper(self.store, Textures.ground);
      },
    );

    this.textureLoader.load(
      `./images/textures/${Textures.concrette}.jpg`,
      (map) => {
        this._number = this.getRepeatByName(Textures.concrette);
        map.repeat.set(this._number, this._number);
        map.wrapS = map.wrapT = THREE.RepeatWrapping;
        map.encoding = THREE.sRGBEncoding;
        this._concrette = map;
        // self.render();
        self.helper.loaderDispatchHelper(self.store, Textures.concrette);
      },
    );

    this.textureLoader.load(`./images/textures/${Textures.sky}.jpg`, (map) => {
      this._number = this.getRepeatByName(Textures.sky);
      map.repeat.set(this._number, this._number);
      map.wrapS = map.wrapT = THREE.RepeatWrapping;
      map.encoding = THREE.sRGBEncoding;
      this.sky = map;
      // self.render();
      self.helper.loaderDispatchHelper(self.store, Textures.sky);
    });

    this.textureLoader.load(
      `./images/textures/${Textures.metall}.jpg`,
      (map) => {
        this._number = this.getRepeatByName(Textures.metall);
        map.repeat.set(this._number, this._number);
        map.wrapS = map.wrapT = THREE.RepeatWrapping;
        map.encoding = THREE.sRGBEncoding;
        this._metall = map;
        // self.render();
        self.helper.loaderDispatchHelper(self.store, Textures.metall);
      },
    );

    // Audio
    self.helper.setAudioToHeroHelper(self, Audios.wind);
    self.helper.setAudioToHeroHelper(self, Audios.steps);
    self.helper.setAudioToHeroHelper(self, Audios.jumpstart);
    self.helper.setAudioToHeroHelper(self, Audios.jumpend);
    self.helper.setAudioToHeroHelper(self, Audios.shot);
    self.helper.setAudioToHeroHelper(self, Audios.hit);

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
        }
      }
    });
    return model;
  }

  // Получить текстуру
  public getTexture(name: Textures): Texture {
    switch (name) {
      case Textures.sky:
        return this.sky;
      case Textures.ground:
        return this._ground;
      case Textures.concrette:
        return this._concrette;
      case Textures.metall:
        return this._metall;
      case Textures.sand:
      default:
        return this._sand;
    }
  }

  // Повторения текстуры по имени
  public getRepeatByName(name: Textures): number {
    switch (name) {
      case Textures.sand:
        return 8192;
      case Textures.ground:
        return 512;
      case Textures.concrette:
        return 8;
      case Textures.metall:
        return 2;
    }
    return 2;
  }

  // Получить материал
  public getMaterial(
    name: Textures,
  ): MeshPhongMaterial | MeshBasicMaterial | MeshStandardMaterial {
    switch (name) {
      case Textures.sky:
        return new THREE.MeshBasicMaterial({
          map: this.getTexture(name),
          color: Colors.sky,
        });
      case Textures.ground:
        return new THREE.MeshPhongMaterial({
          map: this.getTexture(name),
          color: Colors.ground,
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
        return 0.7;
      case Audios.hit:
        return 0.9;
    }
    return DESIGN.DEFAULT_VOLUME;
  }

  // Получить звук
  public getAudio(name: Audios): AudioBuffer {
    console.log('getAudio', name);
    return this._plants; // пример
  }

  // Аудио по имени
  /*
  public getAudioByName(name: Names): Audios {
    return Audios[name as keyof typeof Audios];
  }
  */
}
