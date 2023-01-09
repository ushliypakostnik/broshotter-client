import * as THREE from 'three';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { clone } from '@/components/Scene/World/Math/SkeletonUtils.js';
import { Text } from 'troika-three-text';

// Types
import type { ISelf } from '@/models/modules';
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import type { AnimationAction, AnimationMixer, Group, Mesh } from 'three';

// Constants
import { Names, Textures, DESIGN } from '@/utils/constants';

// Modules
import Octree from '@/components/Scene/World/Math/Octree';
import { IUser, IUserThree } from '@/models/api';
import { Vector3 } from 'three';

export default class Enemies {
  public name = Names.enemies;

  private _model!: Group;
  private _modelClone!: Group;
  // private _mixer!: AnimationMixer;
  // private _action!: AnimationAction;
  private _pseudo!: Mesh;
  private _pseudoClone!: Mesh;
  private _group!: Group;
  private _scale!: Mesh;
  private _scaleClone!: Mesh;
  private _time = 0;
  private _is = false;
  private _time2 = 0;
  private _ids: string[];
  private _name!: Text;
  private _isHide = false;
  private _isRun = false;
  private _isFire = false;
  private _user!: IUser;
  private _userThree!: IUserThree;
  private _target!: Vector3;
  private _direction = new THREE.Vector3();
  private _speed!: number;

  private _list: IUserThree[];
  private _listNew: IUserThree[];

  // Animations
  private _animation!: string;
  private _dead!: AnimationAction;
  private _hide!: AnimationAction;
  private _hideback!: AnimationAction;
  private _hideleft!: AnimationAction;
  private _hideright!: AnimationAction;
  private _hideforward!: AnimationAction;
  private _hit!: AnimationAction;
  private _stand!: AnimationAction;
  private _standforward!: AnimationAction;
  private _standback!: AnimationAction;
  private _standleft!: AnimationAction;
  private _standright!: AnimationAction;
  private _jump!: AnimationAction;
  private _run!: AnimationAction;
  private _firestand!: AnimationAction;
  private _firestandforward!: AnimationAction;
  private _firehide!: AnimationAction;
  private _firehideforward!: AnimationAction;

  private _prevAction!: AnimationAction;
  private _nextAction!: AnimationAction;

  constructor() {
    this._group = new THREE.Group();
    this._target = new THREE.Vector3();

    this._list = [];
    this._listNew = [];
    this._ids = [];
  }

  public init(self: ISelf, weapon: Group): void {
    self.assets.GLTFLoader.load(
      `./images/models/${this.name}.glb`,
      (model: GLTF) => {
        self.helper.loaderDispatchHelper(self.store, this.name);

        this._model = model.scene;
        this._model.traverse((child: any) => {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          if (child.isMesh) {
            child.castShadow = true;
          }
        });

        // this._mixer = new THREE.AnimationMixer(this._model);
        // this._action = this._mixer.clipAction(model.animations[13]);
        // this._action.play();

        this._model.rotation.y = Math.PI / 2;
        this._model.name = this.name;

        const pseudoGeometry = new THREE.BoxBufferGeometry(
          0.6,
          DESIGN.GAMEPLAY.PLAYER_HEIGHT - 0.2,
          0.75,
        );
        this._pseudo = new THREE.Mesh(
          pseudoGeometry,
          self.assets.getMaterial(Textures.pseudo),
        );

        const scaleGeometry = new THREE.PlaneBufferGeometry(1, 0.05);
        this._scale = new THREE.Mesh(
          scaleGeometry,
          self.assets.getMaterial(Textures.scale),
        );

        self.helper.loaderDispatchHelper(self.store, this.name, true);
      },
    );
  }

  // Пересоздание октодерева
  private _updateOctree2(self: ISelf): void {
    this._group = new THREE.Group();
    this._list.forEach((player) => {
      this._pseudoClone = self.scene.getObjectByProperty(
        'uuid',
        player.pseudo,
      ) as Mesh;
      if (this._pseudoClone) this._group.add(this._pseudoClone);
    });
    if (this._group.children.length) {
      self.scene.add(this._group);
      self.octree2 = new Octree();
      self.octree2.fromGraphNode(this._group);
    }
  }

  private _addPlayer(self: ISelf, player: IUserThree): void {
    console.log('Enemies _addPlayer(): ', player);
    this._isHide = player.animation.includes('hide');
    this._modelClone = clone(this._model);

    this._pseudoClone = this._pseudo.clone();
    if (this._isHide) this._pseudoClone.scale.set(1, 0.5, 1);
    else this._pseudoClone.scale.set(1, 1, 1);

    this._scaleClone = this._scale.clone();

    this._name = new Text();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this._name.text = player.name;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this._name.fontSize = 0.25;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this._name.color = 0xffffff;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this._name.sync();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    self.scene.add(this._name);

    this._userThree = {
      ...player,
      mesh: this._modelClone.uuid,
      pseudo: this._pseudoClone.uuid,
      scale: this._scaleClone.uuid,
      text: this._name,
      isHide: this._isHide,
    };
    this._list.push(this._userThree);
    self.scene.add(this._modelClone);
    self.scene.add(this._pseudoClone);
    self.scene.add(this._scaleClone);

    this._animatePlayer(self, this._userThree);
  }

  private _removePlayer(self: ISelf, player: IUserThree): void {
    // console.log('Enemies _removePlayer!!!', player);
  }

  public animate(self: ISelf): void {
    this._time += self.events.delta;
    if (this._time > 0.5) {
      this._updateOctree2(self);
      this._time = 0;
    }

    /* if (this._pseudo && this._model)
      this._pseudo.position.set(
        this._model.position.x,
        this._model.position.y + DESIGN.GAMEPLAY.PLAYER_HEIGHT / 2 - 0.1,
        this._model.position.z,
      );

    if (this._mixer) this._mixer.update(self.events.delta); */

    if (
      self.store.getters['api/game'] &&
      self.store.getters['api/game'].users &&
      (self.store.getters['api/game'].users.length || this._list.length)
    ) {
      this._is = false;
      this._time2 += self.events.delta;
      if (this._time > 1) {
        this._is = true;
        this._time2 = 0;
      }

      this._listNew = self.store.getters['api/game'].users; // TODO: перед релизом отфильтровать юзера!

      this._listNew.forEach((user) => {
        if (user.animation && user.animation.length) {
          if (this._is) this._ids.push(user.id as string);

          this._userThree = this._list.find(
            (player) => player.id === user.id,
          ) as IUserThree;
          if (this._userThree) {
            this._animatePlayer(self, this._userThree);
          } else this._addPlayer(self, user);
        }
      });

      if (this._is) {
        this._list.forEach((player) => {
          if (!this._ids.includes(player.id)) this._removePlayer(self, player);
        });
        this._list = this._list.filter((player) =>
          this._ids.includes(player.id as string),
        );
      }
    }
  }

  private _redrawFire(self: ISelf) {
    /*
    if (!this._isFireOff) this._fireScale += self.events.delta * 50;
    else this._fireScale -= self.events.delta * 50;

    if (this._fireScale > 5) this._isFireOff = true;

    if (this._fireScale >= 0)
      this._weaponFire.scale.set(
        this._fireScale * 1.5,
        this._fireScale * 1.5,
        this._fireScale * 1.5,
      );
    if (this._fireScale >= 5) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this._modelWeaponFire.material.opacity = 1;
    } else if (this._fireScale < 0) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this._modelWeaponFire.material.opacity = 0;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
    } else this._modelWeaponFire.material.opacity = this._fireScale / 5;
    this._modelWeaponFire.rotateX(self.events.delta * -3);
    this._modelWeaponFire.rotateZ(self.events.delta * -3);
    this._modelWeaponFire.rotateY(self.events.delta * -3);

    if (this._fireScale >= 0)
      this._weaponFire.scale.set(
        this._fireScale,
        this._fireScale,
        this._fireScale,
      );
    if (this._fireScale >= 5) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this._weaponFire.material.opacity = 1;
    } else if (this._fireScale < 0) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this._weaponFire.material.opacity = 0;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
    } else this._weaponFire.material.opacity = this._fireScale / 5;
    this._weaponFire.rotateX(self.events.delta * -3);
    this._weaponFire.rotateZ(self.events.delta * -3);
    this._weaponFire.rotateY(self.events.delta * -3);

    if (this._fireScale < 0) {
      this._isFire = false;
      this._isFireOff = false;
      this._fireScale = 0;
      this._weaponFire.visible = false;
      this._opticalFire.visible = false;
      this._modelWeaponFire.visible = false;
    } */
  }

  private _animatePlayer(self: ISelf, user: IUserThree) {
    this._user = self.store.getters['api/game'].users.find(
      (player: IUser) => player.id === user.id,
    );
    if (this._user && user.animation) {
      user.animation = this._user.animation;
      this._isFire = user.animation.includes('fire');
      this._isHide = user.animation.includes('hide');
      this._isRun = user.animation.includes('run');

      if (this._isFire) this._redrawFire(self);

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this._modelClone = self.scene.getObjectByProperty(
        'uuid',
        user.mesh,
      ) as Mesh;

      this._pseudoClone = self.scene.getObjectByProperty(
        'uuid',
        user.pseudo,
      ) as Mesh;
      if (this._pseudoClone) {
        if (this._isHide !== user.isHide) {
          if (this._isHide) this._pseudoClone.scale.set(1, 0.5, 1);
          else this._pseudoClone.scale.set(1, 1, 1);
          user.isHide = this._isHide;
        }
      }

      this._target.set(
        this._user.positionX + 2,
        this._user.positionY - (!this._isHide ? 1.5 : 0.75),
        this._user.positionZ + 2,
      );

      this._speed = this._isHide ? 0.5 : this._isRun ? 2.5 : 1;
      this._speed *= self.events.delta * 8;

      if (this._modelClone.position.x < this._target.x - this._speed * 1.1)
        this._modelClone.position.x += this._speed;
      else if (this._modelClone.position.x > this._target.x + this._speed * 1.1)
        this._modelClone.position.x -= this._speed;
      else this._modelClone.position.x = this._target.x;

      if (this._modelClone.position.z < this._target.z - this._speed * 1.1)
        this._modelClone.position.z += this._speed;
      else if (this._modelClone.position.z > this._target.z + this._speed * 1.1)
        this._modelClone.position.z -= this._speed;
      else this._modelClone.position.z = this._target.z;

      this._modelClone.position.y = this._target.y;

      this._pseudoClone.position.set(
        this._modelClone.position.x,
        this._modelClone.position.y +
          (!this._isHide
            ? DESIGN.GAMEPLAY.PLAYER_HEIGHT / 2
            : DESIGN.GAMEPLAY.PLAYER_HEIGHT / 2 - 0.5),
        this._modelClone.position.z,
      );

      this._direction = new THREE.Vector3(
        this._user.directionX,
        this._user.directionY,
        this._user.directionZ,
      );

      if (this._direction.y > 0)
        this._modelClone.rotation.y =
          2 * Math.atan2(this._user.directionX, this._user.directionY);
      else if (this._direction.y <= 0)
        this._modelClone.rotation.y =
          -2 * Math.atan2(this._user.directionX, this._user.directionY);

      this._scaleClone = self.scene.getObjectByProperty(
        'uuid',
        user.scale,
      ) as Mesh;
      if (this._scaleClone) {
        this._scaleClone.setRotationFromMatrix(self.camera.matrix);
        this._scaleClone.position.set(
          this._modelClone.position.x,
          this._modelClone.position.y -
            DESIGN.GAMEPLAY.PLAYER_HEIGHT / 2 +
            (!this._isHide ? 3.25 : 2.5),
          this._modelClone.position.z,
        );
      }

      this._name = user.text;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this._name.setRotationFromMatrix(self.camera.matrix);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this._name.position.x = this._modelClone.position.x;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this._name.position.y =
        this._modelClone.position.y +
        DESIGN.GAMEPLAY.PLAYER_HEIGHT +
        (!this._isHide ? 1 : 0);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this._name.position.z = this._modelClone.position.z;
    }
  }
}
