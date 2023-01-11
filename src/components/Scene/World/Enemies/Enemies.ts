import * as THREE from 'three';
import {
  AnimationAction,
  AnimationMixer,
  Group,
  Mesh,
  Object3D,
  Vector3,
} from 'three';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { clone } from '@/components/Scene/World/Math/SkeletonUtils.js';
import { Text } from 'troika-three-text';

// Types
import { ISelf } from '@/models/modules';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';

// Constants
import { Animations, Audios, Names, Textures, DESIGN } from '@/utils/constants';

// Modules
import Octree from '@/components/Scene/World/Math/Octree';
import { IUser, IUserThree } from '@/models/api';

export default class Enemies {
  public name = Names.enemies;

  private _isTest = true;

  private _gltf!: GLTF;
  private _model!: Group;
  private _modelClone!: Group;
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
  private _isMove = false;
  private _isRun = false;
  private _isNotJump = false;
  private _isOnHit = false;
  private _isForward = false;
  private _isBackward = false;
  private _isLeft = false;
  private _isRight = false;
  private _isFire = false;
  private _user!: IUser;
  private _userThree!: IUserThree;
  private _target!: Vector3;
  private _direction = new THREE.Vector3();
  private _speed!: number;
  private _weapon!: Group;
  private _weaponClone!: Group;
  private _weaponFire!: Object3D;
  private _animation!: string;
  private _dead!: AnimationAction;

  private _list: IUserThree[];
  private _listNew: IUserThree[];

  private _mixer!: AnimationMixer;

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

        this._gltf = model;

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

        const scaleGeometry = new THREE.PlaneBufferGeometry(1, 0.05);
        this._scale = new THREE.Mesh(
          scaleGeometry,
          self.assets.getMaterial(Textures.scale),
        );

        this._weapon = weapon.clone();
        this._weapon.scale.set(0.03, 0.03, 0.03);

        self.helper.loaderDispatchHelper(self.store, this.name, true);
      },
    );
  }

  // Пересоздание октодерева
  private _updateOctree2(self: ISelf): void {
    this._group = new THREE.Group();
    this._list.forEach((player) => {
      if (player.animation !== 'dead') {
        this._pseudoClone = self.scene.getObjectByProperty(
          'uuid',
          player.pseudo,
        ) as Mesh;
        if (this._pseudoClone) this._group.add(this._pseudoClone);
      }
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
    if (this._isHide) this._pseudoClone.scale.set(1, 0.6, 1);
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

    this._weaponClone = this._weapon.clone();
    this._weaponClone.traverse((child: Object3D) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      if (child.isMesh && child.name.includes('fire')) {
        this._weaponFire = child;
        this._weaponFire.visible = false;
      }
    });

    this._user = self.store.getters['api/game'].users.find(
      (user: IUser) => user.id === player.id,
    );
    this._modelClone.position.set(
      this._user.positionX,
      this._user.positionY,
      this._user.positionZ,
    );

    this._mixer = new THREE.AnimationMixer(this._modelClone);
    this._userThree = {
      ...player,
      mesh: this._modelClone.uuid,
      pseudo: this._pseudoClone.uuid,
      scale: this._scaleClone.uuid,
      weapon: this._weaponClone.uuid,
      fire: this._weaponFire.uuid,
      text: this._name,
      isHide: this._isHide,
      mixer: this._mixer,
      prevAction: this._getAnimation(
        this._mixer,
        player.animation as Animations,
        true,
      ),
      nextAction: this._getAnimation(
        this._mixer,
        player.animation as Animations,
        true,
      ),
      isFire: false,
      isFireOff: false,
      fireScale: 0,
    };
    this._userThree.prevAction.play();
    self.scene.add(this._modelClone);
    self.scene.add(this._pseudoClone);
    self.scene.add(this._scaleClone);
    self.scene.add(this._weaponClone);
    this._list.push(this._userThree);

    if (this._pseudoClone) {
      self.audio.addAudioOnObject(self, this._pseudoClone.uuid, Audios.steps2);
    }

    if (this._pseudoClone) {
      self.audio.addAudioOnObject(
        self,
        this._pseudoClone.uuid,
        Audios.jumpstart2,
      );
    }

    if (this._pseudoClone) {
      self.audio.addAudioOnObject(
        self,
        this._pseudoClone.uuid,
        Audios.jumpend2,
      );
    }

    if (this._pseudoClone) {
      self.audio.addAudioOnObject(self, this._pseudoClone.uuid, Audios.hit2);
    }

    if (this._weaponFire) {
      self.audio.addAudioOnObject(self, this._weaponFire.uuid, Audios.shot2);
    }
  }

  private _removePlayer(): void {
    // console.log('Enemies _removePlayer!!!', player);
  }

  public animate(self: ISelf): void {
    this._time += self.events.delta;
    if (this._time > 0.5) {
      this._updateOctree2(self);
      this._time = 0;
    }

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

      if (this._isTest) this._listNew = self.store.getters['api/game'].users;
      else
        this._listNew = self.store.getters['api/game'].users.filter(
          (user: IUser) => user.id !== self.store.getters['layout/id'],
        );

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
          if (!this._ids.includes(player.id)) this._removePlayer();
        });
        this._list = this._list.filter((player) =>
          this._ids.includes(player.id as string),
        );
      }
    }
  }

  private _redrawFire(self: ISelf, user: IUserThree) {
    if (!user.isFireOff) user.fireScale += self.events.delta * 50;
    else user.fireScale -= self.events.delta * 50;

    if (user.fireScale > 5) user.isFireOff = true;

    this._weaponFire = self.scene.getObjectByProperty(
      'uuid',
      user.fire,
    ) as Mesh;
    if (this._weaponFire) {
      if (user.fireScale >= 0)
        this._weaponFire.scale.set(
          user.fireScale * 1.5,
          user.fireScale * 1.5,
          user.fireScale * 1.5,
        );
      if (user.fireScale >= 5) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        this._weaponFire.material.opacity = 1;
      } else if (user.fireScale < 0) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        this._weaponFire.material.opacity = 0;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
      } else this._weaponFire.material.opacity = user.fireScale / 5;
      this._weaponFire.rotateX(self.events.delta * -3);
      this._weaponFire.rotateZ(self.events.delta * -3);
      this._weaponFire.rotateY(self.events.delta * -3);

      if (user.fireScale < 0) {
        user.isFire = false;
        user.isFireOff = false;
        user.fireScale = 0;
        this._weaponFire.visible = false;
      }
    }
  }

  private _getForwardVectorFromObject(obj: Object3D): Vector3 {
    obj.getWorldDirection(this._direction);
    this._direction.y = 0;
    this._direction.normalize();

    return this._direction;
  }

  private _getSideVectorFromObject = (obj: Object3D) => {
    obj.getWorldDirection(this._direction);
    this._direction.y = 0;
    this._direction.normalize();
    this._direction.cross(obj.up);

    return this._direction;
  };

  private _animatePlayer(self: ISelf, user: IUserThree) {
    this._user = self.store.getters['api/game'].users.find(
      (player: IUser) => player.id === user.id,
    );

    if (this._user) {
      if (this._user.animation) user.animation = this._user.animation;
      if (this._user.isOnHit) user.isOnHit = this._user.isOnHit;
      else this._isOnHit = false;
      if (this._user.isFire) this._isFire = this._user.isFire;
      else this._isFire = false;
      this._isNotJump = !user.animation.includes('jump');
      this._isHide = user.animation.includes('hide');
      this._isRun = user.animation.includes('run');
      this._isForward = user.animation.includes('forward');
      this._isBackward = user.animation.includes('back');
      this._isLeft = user.animation.includes('left');
      this._isRight = user.animation.includes('right');

      if (this._isOnHit !== user.isOnHit) {
        self.audio.replayObjectSound(user.pseudo, Audios.hit2);
        user.isOnHit = this._isOnHit;
      }

      if (user.animation === 'dead') {
        user.isFire = false;
        user.isFireOff = false;
        user.fireScale = 0;
        this._weaponFire.visible = false;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        this._weaponClone = self.scene.getObjectByProperty(
          'uuid',
          user.weapon,
        ) as Mesh;
        if (this._weaponClone) this._weaponClone.visible = false;
      } else {
        if (this._isFire !== user.isFire) {
          this._weaponFire = self.scene.getObjectByProperty(
            'uuid',
            user.fire,
          ) as Mesh;
          if (this._weaponFire) {
            if (this._isFire) {
              user.isFireOff = false;
              user.fireScale = 0;
              this._weaponFire.visible = true;
              self.audio.replayObjectSound(user.fire, Audios.shot2);
            } else {
              user.isFire = false;
              user.isFireOff = false;
              user.fireScale = 0;
              this._weaponFire.visible = false;
            }
          }
          user.isFire = this._isFire;
        }
        if (this._isFire) this._redrawFire(self, user);
      }

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this._modelClone = self.scene.getObjectByProperty(
        'uuid',
        user.mesh,
      ) as Mesh;

      if (this._modelClone) {
        // Steps sound
        this._isMove =
          this._isRun ||
          this._isForward ||
          this._isBackward ||
          this._isLeft ||
          this._isRight;
        if (this._isMove !== user.isMove) {
          if (this._isMove) {
            this._speed = this._isHide ? 0.5 : this._isRun ? 2 : 1;
            self.audio.setPlaybackRateOnObjectSound(
              user.pseudo,
              Audios.steps2,
              this._speed,
            );
            self.audio.replayObjectSound(user.pseudo, Audios.steps2);
          } else self.audio.stopObjectSound(user.pseudo, Audios.steps2);

          user.isMove = this._isMove;
        }

        // Jumps sounds
        if (
          this._isNotJump !== user.isNotJump &&
          self.store.getters['api/isEnter']
        ) {
          if (!this._isNotJump)
            self.audio.replayObjectSound(user.pseudo, Audios.jumpstart2);
          else self.audio.replayObjectSound(user.pseudo, Audios.jumpend2);

          user.isNotJump = this._isNotJump;
        }

        this._pseudoClone = self.scene.getObjectByProperty(
          'uuid',
          user.pseudo,
        ) as Mesh;
        if (this._pseudoClone) {
          if (this._isHide !== user.isHide) {
            if (this._isHide) this._pseudoClone.scale.set(1, 0.6, 1);
            else this._pseudoClone.scale.set(1, 1, 1);
            user.isHide = this._isHide;
          }
        }

        if (user.animation === 'dead')
          user.nextAction = this._getAnimation(user.mixer, Animations.dead);
        else if (!user.isHide && user.animation === 'hit')
          user.nextAction = this._getAnimation(user.mixer, Animations.hit);
        else if (!this._isHide && this._isRun !== user.isRun) {
          if (this._isRun)
            user.nextAction = this._getAnimation(user.mixer, Animations.run);
          else user.nextAction = this._getMove(user.mixer);
          user.isRun = this._isRun;
        } else {
          if (!this._isNotJump && !this._isHide)
            user.nextAction = this._getAnimation(user.mixer, Animations.jump);
          else {
            if (this._isRun)
              user.nextAction = this._getAnimation(user.mixer, Animations.run);
            else user.nextAction = this._getMove(user.mixer);
          }
        }

        if (user.prevAction !== user.nextAction) {
          user.prevAction.fadeOut(0.25);
          user.nextAction.reset().fadeIn(0.25).play();
          user.prevAction = user.nextAction;
        }

        user.mixer.update(self.events.delta);
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
            ? DESIGN.GAMEPLAY.PLAYER_HEIGHT / 2 - 0.1
            : DESIGN.GAMEPLAY.PLAYER_HEIGHT / 2 - 0.4),
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
      this._scaleClone.scale.set(
        this._user.health / 100,
        1,
        this._user.health / 100,
      );

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
        (user.animation === 'dead' ? -1 : !this._isHide ? 0.75 : 0);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this._name.position.z = this._modelClone.position.z;

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this._weaponClone = self.scene.getObjectByProperty(
        'uuid',
        user.weapon,
      ) as Mesh;
      if (this._weaponClone) {
        this._weaponClone.position.copy(this._modelClone.position);
        this._weaponClone.rotation.y = -1 * this._modelClone.rotation.y;

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        this._animation = user.nextAction['_clip'].name;
        if (this._animation === 'jump') {
          this._weaponClone.position.add(
            this._getForwardVectorFromObject(this._weaponClone).multiplyScalar(
              -0.3,
            ),
          );
          this._weaponClone.position.y += 1.8;
        } else if (this._animation === 'stand') {
          this._weaponClone.position
            .add(
              this._getForwardVectorFromObject(
                this._weaponClone,
              ).multiplyScalar(-0.2),
            )
            .add(
              this._getSideVectorFromObject(this._weaponClone).multiplyScalar(
                -0.1,
              ),
            );
          if (this._animation.includes('fire'))
            this._weaponClone.position.y += 1.5;
          else this._weaponClone.position.y += 1.28;
          this._weaponClone.rotation.y -= 1.2;
        } else if (this._animation.includes('hide')) {
          if (this._animation === 'hide' || this._animation === 'firehide') {
            this._weaponClone.position
              .add(
                this._getForwardVectorFromObject(
                  this._weaponClone,
                ).multiplyScalar(this._animation === 'firehide' ? -0.3 : -0.2),
              )
              .add(
                this._getSideVectorFromObject(this._weaponClone)
                  .negate()
                  .multiplyScalar(0.25),
              );
            this._weaponClone.position.y +=
              this._animation === 'firehide' ? 0.95 : 0.9;
          } else {
            this._weaponClone.position
              .add(
                this._getForwardVectorFromObject(
                  this._weaponClone,
                ).multiplyScalar(-0.4),
              )
              .add(
                this._getSideVectorFromObject(this._weaponClone).multiplyScalar(
                  this._isBackward ? 0 : 0.1,
                ),
              );
            this._weaponClone.position.y += 1.2;
          }
        } else {
          this._weaponClone.position
            .add(
              this._getForwardVectorFromObject(
                this._weaponClone,
              ).multiplyScalar(-0.2),
            )
            .add(
              this._getSideVectorFromObject(this._weaponClone).multiplyScalar(
                -0.15,
              ),
            );
          this._weaponClone.position.y +=
            this._isForward || this._isBackward
              ? 1.45
              : this._animation.includes('fire')
              ? 1.5
              : 1.3;
        }
      }
    }
  }

  private _getMove(mixer: AnimationMixer): AnimationAction {
    if (this._isHide) {
      if (this._isForward) {
        if (this._isFire)
          return this._getAnimation(mixer, Animations.firehideforward);
        else return this._getAnimation(mixer, Animations.hideforward);
      } else if (this._isBackward)
        return this._getAnimation(mixer, Animations.hideback);
      else if (this._isLeft)
        return this._getAnimation(mixer, Animations.hideleft);
      else if (this._isRight)
        return this._getAnimation(mixer, Animations.hideright);
      if (this._isFire) return this._getAnimation(mixer, Animations.firehide);
      else return this._getAnimation(mixer, Animations.hide);
    } else {
      if (this._isForward) {
        if (this._isFire)
          return this._getAnimation(mixer, Animations.firestandforward);
        else return this._getAnimation(mixer, Animations.standforward);
      } else if (this._isBackward)
        return this._getAnimation(mixer, Animations.standback);
      else if (this._isLeft)
        return this._getAnimation(mixer, Animations.standleft);
      else if (this._isRight)
        return this._getAnimation(mixer, Animations.standright);
    }
    if (this._isFire) return this._getAnimation(mixer, Animations.firestand);
    return this._getAnimation(mixer, Animations.stand);
  }

  private _getAnimation(
    mixer: AnimationMixer,
    name: Animations,
    isStart = false,
  ): AnimationAction {
    switch (name) {
      case Animations.dead:
        this._dead = mixer.clipAction(this._gltf.animations[0]);
        this._dead.setLoop(THREE.LoopOnce, 1);
        this._dead.clampWhenFinished = true;
        if (isStart) this._dead.setDuration(0);
        return this._dead;
      case Animations.hide:
        return mixer.clipAction(this._gltf.animations[5]);
      case Animations.hideback:
        return mixer.clipAction(this._gltf.animations[6]);
      case Animations.hideleft:
        return mixer.clipAction(this._gltf.animations[8]);
      case Animations.hideright:
        return mixer.clipAction(this._gltf.animations[9]);
      case Animations.hideforward:
        return mixer.clipAction(this._gltf.animations[7]);
      case Animations.hit:
        return mixer.clipAction(this._gltf.animations[10]);
      case Animations.stand:
        return mixer.clipAction(this._gltf.animations[13]);
      case Animations.standforward:
        return mixer.clipAction(this._gltf.animations[15]);
      case Animations.standback:
        return mixer.clipAction(this._gltf.animations[14]);
      case Animations.standleft:
        return mixer.clipAction(this._gltf.animations[16]);
      case Animations.standright:
        return mixer.clipAction(this._gltf.animations[17]);
      case Animations.jump:
        return mixer.clipAction(this._gltf.animations[11]);
      case Animations.run:
        return mixer.clipAction(this._gltf.animations[12]);
      case Animations.firestand:
        return mixer.clipAction(this._gltf.animations[3]);
      case Animations.firestandforward:
        return mixer.clipAction(this._gltf.animations[4]);
      case Animations.firehide:
        return mixer.clipAction(this._gltf.animations[1]);
      case Animations.firehideforward:
        return mixer.clipAction(this._gltf.animations[2]);
    }
    return mixer.clipAction(this._gltf.animations[13]);
  }
}
