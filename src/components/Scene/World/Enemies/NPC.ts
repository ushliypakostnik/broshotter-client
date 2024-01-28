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
  Vector3,
} from 'three';
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import type { ISelf } from '@/models/modules';
import type { IUnit, IUserThree, IUnitInfo } from '@/models/api';

// Constants
import { Animations, Names, Textures, DESIGN } from '@/utils/constants';

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
  private _listNew2: IUserThree[];
  private _ids: string[];
  private _ids2: string[];
  private _ids3: string[];
  private _time = 0;
  private _is = false;
  private _npcThree!: IUserThree;
  private _animation!: AnimationAction;
  private _target: Vector3;
  private _speed = 0;
  private _v1!: Vector3;
  private _v2!: Vector3;

  constructor() {
    this._list = [];
    this._listNew = [];
    this._listNew2 = [];
    this._ids = [];
    this._ids2 = [];
    this._ids3 = [];
    this._target = new THREE.Vector3();
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
        this._model.name = this.name;
        this._model.position.set(0, 0, 0);

        const pseudoGeometry = new THREE.BoxBufferGeometry(
          0.6,
          DESIGN.GAMEPLAY.PLAYER_HEIGHT - 0.4,
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
    console.log('NPC _addNPC()!!!');
    this._modelClone = clone(this._model);
    this._pseudoClone = this._pseudo.clone();
    this._soundClone = this._sound.clone();
    this._scaleClone = this._scale.clone();

    this._modelClone.position.set(
      unit.positionX,
      unit.positionY,
      unit.positionZ,
    );
    this._pseudoClone.position.set(
      unit.positionX,
      unit.positionY + 0.9,
      unit.positionZ,
    );
    this._soundClone.position.set(
      unit.positionX,
      unit.positionY + 1.1,
      unit.positionZ,
    );
    this._scaleClone.setRotationFromMatrix(self.camera.matrix);
    this._scaleClone.position.set(
      this._modelClone.position.x,
      this._modelClone.position.y - DESIGN.GAMEPLAY.PLAYER_HEIGHT / 2 + 3,
      this._modelClone.position.z,
    );
    this._scaleClone.scale.set(unit.health / 100, 1, unit.health / 100);

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

    this._ids2.push(unit.id);
  }

  private _removeNPC(self: ISelf, unit: IUserThree): void {
    console.log('NPC _removeNPC(): ', unit);
    this._modelClone = self.scene.getObjectByProperty(
      'uuid',
      unit.model,
    ) as Group;
    if (this._modelClone) self.scene.remove(this._modelClone);
    this._pseudoClone = self.scene.getObjectByProperty(
      'uuid',
      unit.pseudo,
    ) as Mesh;
    if (this._pseudoClone) self.scene.remove(this._pseudoClone);
    this._soundClone = self.scene.getObjectByProperty(
      'uuid',
      unit.sound,
    ) as Mesh;
    if (this._soundClone) self.scene.remove(this._soundClone);
    this._scaleClone = self.scene.getObjectByProperty(
      'uuid',
      unit.scale,
    ) as Mesh;
    if (this._scaleClone) self.scene.remove(this._scaleClone);
  }

  private _animateNPC(self: ISelf, unit: IUserThree, info: IUnit): void {
    // console.log('NPC _animateNPC(): ', unit);
    if (info.animation !== 'dead') {
      this._modelClone = self.scene.getObjectByProperty(
        'uuid',
        unit.model,
      ) as Group;
      if (this._modelClone) {
        this._speed = self.events.delta * 2.5;

        if (this._modelClone.rotation.y < info.directionY - this._speed * 1.1)
          this._modelClone.rotation.y += this._speed;
        else if (
          this._modelClone.rotation.y >
          info.directionY + this._speed * 1.1
        )
          this._modelClone.rotation.y -= this._speed;
        else this._modelClone.rotation.y = info.directionY;

        this._target.set(info.positionX, info.positionY, info.positionZ);

        if (this._modelClone.position.x < this._target.x - this._speed * 1.1)
          this._modelClone.position.x += this._speed;
        else if (
          this._modelClone.position.x >
          this._target.x + this._speed * 1.1
        )
          this._modelClone.position.x -= this._speed;
        else this._modelClone.position.x = this._target.x;

        if (this._modelClone.position.y < this._target.y - this._speed * 1.1)
          this._modelClone.position.y += this._speed;
        else if (
          this._modelClone.position.y >
          this._target.y + this._speed * 1.1
        )
          this._modelClone.position.y -= this._speed;
        else this._modelClone.position.y = this._target.y;

        if (this._modelClone.position.z < this._target.z - this._speed * 1.1)
          this._modelClone.position.z += this._speed;
        else if (
          this._modelClone.position.z >
          this._target.z + this._speed * 1.1
        )
          this._modelClone.position.z -= this._speed;
        else this._modelClone.position.z = this._target.z;

        this._pseudoClone = self.scene.getObjectByProperty(
          'uuid',
          unit.pseudo,
        ) as Mesh;
        if (this._pseudoClone) {
          this._pseudoClone.position.set(
            this._modelClone.position.x,
            this._modelClone.position.y + 0.9,
            this._modelClone.position.z,
          );
        }
        this._soundClone = self.scene.getObjectByProperty(
          'uuid',
          unit.sound,
        ) as Mesh;
        if (this._soundClone) {
          this._soundClone.position.set(
            this._modelClone.position.x,
            this._modelClone.position.y + 1.1,
            this._modelClone.position.z,
          );
        }
      }

      this._scaleClone = self.scene.getObjectByProperty(
        'uuid',
        unit.scale,
      ) as Mesh;
      if (this._scaleClone) {
        this._scaleClone.setRotationFromMatrix(self.camera.matrix);
        this._scaleClone.position.set(
          this._modelClone.position.x,
          this._modelClone.position.y - DESIGN.GAMEPLAY.PLAYER_HEIGHT / 2 + 3,
          this._modelClone.position.z,
        );
        this._scaleClone.scale.set(unit.health / 100, 1, unit.health / 100);
      }
    }

    if (info.animation === 'dead')
      unit.nextAction = this._getAnimation(unit.mixer, Animations.dead);
    else if (info.animation === 'hit')
      unit.nextAction = this._getAnimation(unit.mixer, Animations.hit);
    else if (info.animation === 'run')
      unit.nextAction = this._getAnimation(unit.mixer, Animations.run);
    else if (info.animation === 'jump')
      unit.nextAction = this._getAnimation(unit.mixer, Animations.jump);
    else if (info.animation === 'walking')
      unit.nextAction = this._getAnimation(unit.mixer, Animations.walking);
    else unit.nextAction = this._getAnimation(unit.mixer, Animations.idle);

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (unit.prevAction['_clip'].name !== unit.nextAction['_clip'].name) {
      unit.prevAction.fadeOut(0.5);
      unit.nextAction.reset().fadeIn(0.5).play();
      unit.prevAction = unit.nextAction;
    }

    unit.mixer.update(self.events.delta);
  }

  public animate(self: ISelf): void {
    // Animate
    // console.log('NPC: ', self.store.getters['api/game'].npc.zombies.length, this._list);
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
        this._ids = [];
        this._ids3 = [];
        this._setNewList(self);
      }

      if (!this._listNew2.length) this._setNewList(self);

      this._listNew2.forEach((npc: IUnit, index) => {
        if (this._is) this._ids3.push(npc.id as string);
        this._npcThree = this._list.find(
          (unit: IUserThree) => unit.id === npc.id,
        ) as IUserThree;
        if (this._npcThree) {
          if (this._ids2.includes(npc.id)) {
            this._npcThree.positionX = npc.positionX;
            this._npcThree.positionY = npc.positionY;
            this._npcThree.positionZ = npc.positionZ;
            this._animateNPC(self, this._npcThree, npc);
          }
        } else this._addNPC(self, npc);
      });

      if (this._is) {
        this._list.forEach((npc) => {
          if (
            this._ids2.includes(npc.id) &&
            (!this._ids3.includes(npc.id) || !this._ids.includes(npc.id))
          ) {
            this._ids2 = this._ids2.filter((id) => id !== npc.id);
            this._removeNPC(self, npc);
          }
        });
        this._list = this._list.filter(
          (npc) =>
            this._ids.includes(npc.id as string) || this._ids3.includes(npc.id),
        );
      }
    }
  }

  private _setNewList(self: ISelf): void {
    this._listNew = JSON.parse(
      JSON.stringify(self.store.getters['api/game'].npc.zombies),
    );
    this._listNew.forEach((npc: IUnit) => {
      this._ids.push(npc.id as string);
    });

    // Берем только 15 ближайщих
    this._listNew2 = this._listNew
      .sort((a: IUnit, b: IUnit) => {
        this._v1 = new THREE.Vector3(a.positionX, a.positionY, a.positionZ);
        this._v2 = new THREE.Vector3(b.positionX, b.positionY, b.positionZ);

        return (
          this._v1.distanceTo(self.camera.position) -
          this._v2.distanceTo(self.camera.position)
        );
      })
      .slice(0, 20);
  }

  private _getAnimation(
    mixer: AnimationMixer,
    name: Animations,
    isStart = false,
  ): AnimationAction {
    switch (name) {
      case Animations.dead:
        this._animation = mixer.clipAction(this._gltf.animations[0]);
        this._animation.setLoop(THREE.LoopOnce, 1);
        this._animation.clampWhenFinished = true;
        if (isStart) this._animation.setDuration(0);
        return this._animation;
      case Animations.hit:
        return mixer.clipAction(this._gltf.animations[1]);
      case Animations.idle:
        return mixer.clipAction(this._gltf.animations[2]);
      case Animations.jump:
        this._animation = mixer.clipAction(this._gltf.animations[3]);
        this._animation.setLoop(THREE.LoopOnce, 1);
        this._animation.setDuration(5);
        return this._animation;
      case Animations.kick:
        return mixer.clipAction(this._gltf.animations[4]);
      case Animations.run:
        return mixer.clipAction(this._gltf.animations[5]);
      case Animations.walking:
        return mixer.clipAction(this._gltf.animations[6]);
    }
    return mixer.clipAction(this._gltf.animations[2]);
  }
}
