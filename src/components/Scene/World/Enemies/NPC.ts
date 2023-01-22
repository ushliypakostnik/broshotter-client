import * as THREE from 'three';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { clone } from '@/components/Scene/World/Utils/SkeletonUtils.js';

// Types
import type {
  AnimationAction,
  AnimationMixer,
  Group,
  Mesh,
} from 'three';
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import type { ISelf } from '@/models/modules';
import type { IUnit, IUserThree, IUnitInfo} from '@/models/api';

// Constants
import { Animations, DESIGN, Names, Textures } from '@/utils/constants';

export default class NPC {
  public name = Names.zombies;

  private _gltf!: GLTF;
  private _model!: Group;
  private _modelClone!: Group;
  private _mixer!: AnimationMixer;
  private _pseudo!: Mesh;
  private _pseudoClone!: Mesh;
  private _sound!: Mesh;
  private _soundClone!: Mesh;
  private _scale!: Mesh;
  private _scaleClone!: Mesh;

  private _list: IUserThree[];
  private _listNew: IUserThree[];
  private _ids: string[];
  private _time = 0;
  private _is = false;
  private _npcThree!: IUserThree;

  constructor() {
    this._list = [];
    this._listNew = [];
    this._ids = [];
  }

  public init(self: ISelf): void {
    console.log('NPC init!!!');
    self.assets.GLTFLoader.load(
      `./images/models/${this.name}1.glb`,
      (model: GLTF) => {
        self.helper.loaderDispatchHelper(self.store, this.name);

        this._gltf = model;

        console.log('Zombies animation: ', this._gltf.animations);

        this._model = this._gltf.scene;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this._model.traverse((child: any) => {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          if (child.isMesh) {
            child.castShadow = true;
          }
        });
        this._model.rotation.y = Math.PI / 2;
        this._model.name = this.name;

        this._model.position.set(0, -1.5, 0);

        // this._mixer = new THREE.AnimationMixer(this._model);

        const pseudoGeometry = new THREE.BoxBufferGeometry(
          0.6,
          DESIGN.GAMEPLAY.PLAYER_HEIGHT - 0.2,
          0.75,
        );
        this._pseudo = new THREE.Mesh(
          pseudoGeometry,
          self.assets.getMaterial(Textures.pseudo),
        );
        this._pseudo.visible = false;

        this._sound = new THREE.Mesh(
          new THREE.SphereGeometry(0.5, 1, 1),
          self.assets.getMaterial(Textures.hole),
        );
        this._sound.visible = false;

        const scaleGeometry = new THREE.PlaneBufferGeometry(1, 0.05);
        this._scale = new THREE.Mesh(
          scaleGeometry,
          self.assets.getMaterial(Textures.scale),
        );

        self.scene.add(this._model);

        self.helper.loaderDispatchHelper(self.store, this.name, true);
      },
    );
  }

  // Взять информацию о неписях
  public getList(): IUnitInfo[] {
    return this._list.map((unit: IUserThree) => {
      return {
        id: unit.id,
        pseudo: unit.pseudo,
        positionX: unit.positionX,
        positionY: unit.positionY,
        positionZ: unit.positionZ,
        animation: unit.animation,
      };
    });
  }

  private _addNPC(self: ISelf, unit: IUnit): void {
    console.log('NPC _addNPC(): ', this._model);
    this._modelClone = clone(this._model);
    this._pseudoClone = this._pseudo.clone();
    this._soundClone = this._sound.clone();
    this._scaleClone = this._scale.clone();

    this._modelClone.position.set(
      unit.positionX,
      unit.positionY,
      unit.positionZ,
    );

    this._mixer = new THREE.AnimationMixer(this._modelClone);
    this._npcThree = {
      ...unit,
      isRun: false,
      isMove: false,
      isNotJump: false,
      health: unit.health,
      animation: unit.animation,
      isOnHit: unit.isOnHit,
      model: this._modelClone.uuid,
      pseudo: this._pseudoClone.uuid,
      sound: this._soundClone.uuid,
      scale: this._scaleClone.uuid,
      weapon: '',
      fire: '',
      text: null,
      isHide: false,
      mixer: this._mixer,
      prevAction: this._getAnimation(
        this._mixer,
        unit.animation as Animations,
        true,
      ),
      nextAction: this._getAnimation(
        this._mixer,
        unit.animation as Animations,
        true,
      ),
      isFire: false,
      isFireOff: false,
      fireScale: 0,
      isDead: unit.animation === 'dead',
    };
    this._npcThree.prevAction.play();
    self.scene.add(this._modelClone);
    self.scene.add(this._pseudoClone);
    self.scene.add(this._soundClone);
    self.scene.add(this._scaleClone);
    this._list.push(this._npcThree);
  }

  private _removeNPC(self: ISelf, id: string): void {
    console.log('NPC _removeNPC(): ', id);
  }

  private _animateNPC(self: ISelf, unit: IUserThree): void {
    console.log('NPC _animateNPC(): ', unit);
  }

  public animate(self: ISelf): void {
    // Animate
    console.log('NPC: ', self.store.getters['api/game'].npc.zombies.length, this._list);
    if (
      self.store.getters['api/game'] &&
      self.store.getters['api/game'].npc &&
      self.store.getters['api/game'].npc.zombies &&
      (self.store.getters['api/game'].npc.zombies.length || this._list.length)
    ) {
      this._is = false;
      this._time += self.events.delta;
      if (this._time > 1) {
        this._is = true;
        this._time = 0;
      }

      // TODO: Пока только Зомби!
      this._listNew = self.store.getters['api/game'].npc.zombies;

      this._listNew.forEach((npc: IUnit) => {
        if (npc.animation && npc.animation.length) {
          if (this._is) this._ids.push(npc.id as string);

          this._npcThree = this._list.find(
            (unit: IUserThree) => unit.id === unit.id,
          ) as IUserThree;
          if (this._npcThree) this._animateNPC(self, this._npcThree);
          else this._addNPC(self, npc);
        }
      });

      if (this._is) {
        this._list.forEach((npc: IUserThree) => {
          if (!this._ids.includes(npc.id)) this._removeNPC(self, npc.id);
        });
        this._list = this._list.filter((npc) =>
          this._ids.includes(npc.id as string),
        );
      }
    }
  }

  private _getAnimation(
    mixer: AnimationMixer,
    name: Animations,
    isStart = false,
  ): AnimationAction {
    switch (name) {
      case Animations.idle:
        return mixer.clipAction(this._gltf.animations[2]);
    }
    return mixer.clipAction(this._gltf.animations[2]);
  }
}
