import * as THREE from 'three';

// Constants
import { Audios, Colors, DESIGN, Names } from '@/utils/constants';

// Types
import type {
  AnimationAction,
  AnimationMixer,
  Group,
  Object3D,
  PointLight,
  Vector3,
  Clock,
} from 'three';
import type { ISelf } from '@/models/modules';
import type { TResult } from '@/models/utils';
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';

// Modules
import Octree from '@/components/Scene/World/Math/Octree';
import Capsule from '@/components/Scene/World/Math/Capsule';

export default class Hero {
  public name = Names.hero;

  private _octree!: Octree;
  private _model!: Group;
  private _mixer!: AnimationMixer;
  private _action!: AnimationAction;
  private _collider!: Capsule;
  private _velocity: Vector3;
  private _direction: Vector3;
  private _isOnFloor2: boolean;
  private _isOnFloor: boolean;
  private _speed!: number;
  private _result!: TResult;
  private _jumpStart!: number;
  private _jumpFinish!: number;
  private _toruch!: PointLight;
  private _weapon!: Group;
  private _optical!: Group;
  private _weaponDirection!: Vector3;
  private _weaponPosition!: Vector3;
  private _weaponVelocity!: Vector3;
  private _weaponUpVelocity!: Vector3;
  private _weaponFire!: Object3D;
  private _opticalFire!: Object3D;
  private _is = false;
  private _isPause = false;
  private _isHide = false;
  private _isRun = false;
  private _isTired = false;
  private _isOptical = false;
  private _endurance!: number;
  private _enduranceClock!: Clock;
  private _isEnduranceRecoveryStart = false;
  private _enduranceTime = 0;
  private _isFire = false;
  private _isFireOff = false;
  private _fireScale = 0;

  constructor() {
    this._velocity = new THREE.Vector3();
    this._direction = new THREE.Vector3();
    this._isOnFloor2 = true;
    this._isOnFloor = true;
    this._weaponDirection = new THREE.Vector3();
    this._weaponPosition = new THREE.Vector3();
    this._weaponVelocity = new THREE.Vector3();
    this._weaponUpVelocity = new THREE.Vector3();
    this._enduranceClock = new THREE.Clock();
  }

  public setHidden(self: ISelf, isHidden: boolean): void {
    if (!isHidden) {
      this._collider = new Capsule(
        new THREE.Vector3(
          self.camera.position.x,
          self.camera.position.y + DESIGN.GAMEPLAY.PLAYER_HEIGHT / 2,
          self.camera.position.z,
        ),
        new THREE.Vector3(
          self.camera.position.x,
          self.camera.position.y - DESIGN.GAMEPLAY.PLAYER_HEIGHT / 2,
          self.camera.position.z,
        ),
        1,
      );
      self.audio.setPlaybackRateOnHeroSound(Audios.steps, 1);
    } else {
      this._collider = new Capsule(
        new THREE.Vector3(
          self.camera.position.x,
          self.camera.position.y,
          self.camera.position.z,
        ),
        new THREE.Vector3(
          self.camera.position.x,
          self.camera.position.y - DESIGN.GAMEPLAY.PLAYER_HEIGHT / 2,
          self.camera.position.z,
        ),
        1,
      );
      self.audio.setPlaybackRateOnHeroSound(Audios.steps, 0.5);
    }
  }

  public init(self: ISelf, octree: Octree, weapon: Group): void {
    this._octree = octree;

    this._collider = new Capsule(
      new THREE.Vector3(
        self.camera.position.x,
        self.camera.position.y + DESIGN.GAMEPLAY.PLAYER_HEIGHT / 2,
        self.camera.position.z,
      ),
      new THREE.Vector3(
        self.camera.position.x,
        self.camera.position.y - DESIGN.GAMEPLAY.PLAYER_HEIGHT / 2,
        self.camera.position.z,
      ),
      1,
    );

    const hero = self.store.getters['api/hero'];
    this._direction.copy(
      new THREE.Vector3(hero.directionX, 0, hero.directionZ),
    );
    self.camera.lookAt(this._direction.multiplyScalar(1000));

    this._weapon = weapon;
    this._weapon.traverse((child: Object3D) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      if (child.isMesh && child.name.includes('fire')) {
        this._weaponFire = child;
        this._weaponFire.visible = false;
      }
    });
    self.scene.add(this._weapon);

    self.assets.GLTFLoader.load(
      './images/models/optical.glb',
      (model: GLTF) => {
        self.helper.loaderDispatchHelper(self.store, 'optical' as Names);

        this._optical = self.assets.traverseHelper(self, model).scene;
        this._optical.traverse((child: Object3D) => {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          if (child.isMesh && child.name.includes('fire')) {
            this._opticalFire = child;
            this._opticalFire.visible = false;
          }
        });
        this._optical.scale.set(0.1, 0.1, 0.1);
        this._optical.visible = false;

        self.scene.add(this._optical);
        this._animateWeapon(self);

        self.render();
        self.helper.loaderDispatchHelper(self.store, this.name, true);
      },
    );

    self.assets.GLTFLoader.load(
      `./images/models/${this.name}.glb`,
      (model: GLTF) => {
        self.helper.loaderDispatchHelper(self.store, this.name);

        this._model = model.scene;

        this._mixer = new THREE.AnimationMixer(this._model);
        this._action = this._mixer.clipAction(model.animations[1]);
        this._action.play();

        this._model.rotation.y = Math.PI / 2;
        this._model.position.set(-4, 0, 4);
        this._model.name = this.name;

        self.scene.add(this._model);
        // self.render();

        self.helper.loaderDispatchHelper(self.store, this.name, true);
      },
    );

    // Toruch
    this._toruch = new THREE.PointLight(Colors.sun, 1.25, 50);
    self.scene.add(this._toruch);
  }

  private _animateWeapon(self: ISelf): void {
    this._setWeaponData(self);
    this._checkWeapon(self);
  }

  private _setWeaponData(self: ISelf): void {
    self.camera.getWorldDirection(this._weaponDirection);
    this._weaponPosition.copy(self.camera.position);
  }

  private _checkWeapon(self: ISelf): void {
    if (this._weapon && this._optical) {
      if (self.camera.getWorldDirection(this._direction).y > -1) {
        if (self.store.getters['layout/isOptical']) {
          this._optical.setRotationFromMatrix(self.camera.matrix);
          this._optical.position.copy(this._weaponPosition);
          this._weapon.position.add(
            this._getForwardVector(self).multiplyScalar(0.5),
          );
          this._optical.visible = true;
          this._weapon.visible = false;
        } else {
          this._weapon.setRotationFromMatrix(self.camera.matrix);

          this._weaponVelocity.addScaledVector(
            this._weaponVelocity,
            self.helper.damping(self.events.delta),
          );
          this._weaponUpVelocity.addScaledVector(
            this._weaponUpVelocity,
            self.helper.damping(self.events.delta),
          );
          if (self.camera.getWorldDirection(this._direction).y < 0.75) {
            this._weapon.position
              .copy(this._weaponPosition)
              .add(this._weaponVelocity);
            this._weapon.position.y -= 0.1;
            this._weapon.position
              .add(this._getSideVector(self).multiplyScalar(0.26))
              .add(this._getForwardVector(self).multiplyScalar(0.16));
          } else {
            this._weapon.position
              .copy(this._weaponPosition)
              .add(this._weaponUpVelocity);
            this._weapon.position.add(
              this._getForwardVector(self).multiplyScalar(0.2),
            );
          }
          this._weapon.visible = true;
          this._optical.visible = false;
        }
      } else {
        this._weapon.visible = false;
        this._optical.visible = true;
      }
    }
  }

  // Когда получен толчек извне
  /* this.onShot = (scope, direction) => {
    playerVelocity.add(direction.multiplyScalar(-1 * DESIGN.HERO.recoil.shot * scope.delta));
  }; */

  public shot(self: ISelf) {
    self.audio.replayHeroSound(Audios.shot);
    this._isOptical = self.store.getters['layout/isOptical'];

    // Update fire;
    this._isFire = true;
    this._isFireOff = false;
    this._fireScale = 0;
    this._toggleFire(this._isOptical);

    // recoil
    if (this._isOptical)
      this._velocity.add(
        this._getForwardVector(self).multiplyScalar(
          -1 * 60 * self.events.delta,
        ),
      );
    else
      this._velocity.add(
        this._getForwardVector(self).multiplyScalar(
          -1 * 30 * self.events.delta,
        ),
      );
    this._weaponVelocity.add(
      this._getForwardVector(self).multiplyScalar(
        -1 * self.events.delta,
      ),
    );
    this._weaponUpVelocity.add(
      self.camera
        .getWorldDirection(this._direction)
        .normalize()
        .multiplyScalar(-1 * self.events.delta),
    );
  }

  private _toggleFire(value: boolean): void {
    if (this._isFire) {
      if (!value) {
        this._weaponFire.visible = true;
        this._opticalFire.visible = false;
      } else {
        this._weaponFire.visible = false;
        this._opticalFire.visible = true;
      }
    }
  }

  private _getForwardVector(self: ISelf) {
    self.camera.getWorldDirection(this._direction);
    this._direction.y = 0;
    this._direction.normalize();

    return this._direction;
  }

  private _getSideVector = (self: ISelf) => {
    self.camera.getWorldDirection(this._direction);
    this._direction.y = 0;
    this._direction.normalize();
    this._direction.cross(self.camera.up);

    return this._direction;
  };

  private _playerCollitions = (self: ISelf) => {
    if (this._octree) {
      this._result = this._octree.capsuleIntersect(this._collider);
      this._isOnFloor = false;

      if (this._result) {
        this._isOnFloor = this._result.normal.y > 0;

        if (!this._isOnFloor) {
          this._velocity.addScaledVector(
            this._result.normal,
            -this._result.normal.dot(this._velocity),
          );
        }

        this._collider.translate(
          this._result.normal.multiplyScalar(this._result.depth),
        );
      }

      if (this._isOnFloor2 !== this._isOnFloor) {
        if (!this._isOnFloor) this._jumpStart = this._collider.end.y;
        else if (this._jumpStart) {
          this._jumpFinish = this._jumpStart - this._collider.end.y;

          // if (jumpFinish > 15 && !scope.isNotDamaged) scope.events.heroOnHitDispatchHelper(scope, -2 * (jumpFinish - 15));

          // Sound
          this._is = self.store.getters['layout/isPause'];
          if (Math.abs(this._jumpFinish) > 0.1 && !this._is)
            self.audio.replayHeroSound(Audios.jumpend);
        }
      }
      this._isOnFloor2 = this._isOnFloor;
    }
  };

  private _redrawFire(self: ISelf) {
    if (!this._isFireOff) this._fireScale += self.events.delta * 50;
    else this._fireScale -= self.events.delta * 50;

    if (this._fireScale > 5) this._isFireOff = true;

    if (!this._isOptical) {
      if (this._fireScale >= 0) this._weaponFire.scale.set(this._fireScale, this._fireScale, this._fireScale);
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
    } else {
      if (this._fireScale >= 0) this._opticalFire.scale.set(this._fireScale / 1.5, this._fireScale / 1.5, this._fireScale / 1.5);
      if (this._fireScale >= 5) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        this._opticalFire.material.opacity = 1;
      } else if (this._fireScale < 0) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        this._opticalFire.material.opacity = 0;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
      } else this._opticalFire.material.opacity = this._fireScale / 5;
      this._opticalFire.rotateX(self.events.delta * -3);
      this._opticalFire.rotateZ(self.events.delta * -3);
      this._opticalFire.rotateY(self.events.delta * -3);
    }

    if (this._fireScale < 0) {
      this._isFire = false;
      this._isFireOff = false;
      this._fireScale = 0;
      this._weaponFire.visible = false;
      this._opticalFire.visible = false;
    }
  }

  public animate(self: ISelf): void {
    this._endurance = self.store.getters['layout/endurance'];
    this._isHide = self.store.getters['layout/isHide'];
    this._isPause = self.store.getters['layout/isPause'];
    this._isRun = self.store.getters['layout/isRun'];
    this._isTired = self.store.getters['layout/isTired'];

    if (this._isFire) this._redrawFire(self);

    // Усталость и ее восстановление
    if (
      this._isRun ||
      this._isTired ||
      (!this._isRun && !this._isTired && this._endurance < 100)
    ) {
      if (this._isRun && !this._enduranceClock.running)
        this._enduranceClock.start();

      if (
        !this._isEnduranceRecoveryStart &&
        this._endurance < 100 &&
        !this._isRun
      ) {
        this._isEnduranceRecoveryStart = true;
        this._enduranceClock.start();
      } else if (this._isEnduranceRecoveryStart && this._isRun)
        this._isEnduranceRecoveryStart = false;

      if (this._isOnFloor2)
        this._enduranceTime += this._enduranceClock.getDelta();

      if (this._enduranceTime > 0.035) {
        self.store.dispatch('layout/setLayoutState', {
          field: 'endurance',
          value: !this._isEnduranceRecoveryStart ? -1 : 1,
        });
        this._enduranceTime = 0;
      }
    } else {
      if (this._enduranceClock.running) this._enduranceClock.stop();
      if (this._isEnduranceRecoveryStart)
        this._isEnduranceRecoveryStart = false;
      this._enduranceTime = 0;
    }

    if (this._isOnFloor2) {
      if (!this._isPause) {
        if (self.keys['KeyW']) {
          this._speed = this._isHide
            ? DESIGN.GAMEPLAY.PLAYER_SPEED / 2
            : this._isRun
            ? DESIGN.GAMEPLAY.PLAYER_SPEED * 2
            : DESIGN.GAMEPLAY.PLAYER_SPEED;
          this._velocity.add(
            this._getForwardVector(self).multiplyScalar(
              this._speed * self.events.delta,
            ),
          );

          if (
            (self.keys['ShiftLeft'] || self.keys['ShiftRight']) &&
            !this._isHide &&
            !this._isTired &&
            !this._isRun
          ) {
            self.store.dispatch('layout/setLayoutState', {
              field: 'isRun',
              value: true,
            });
          }
        }

        if (self.keys['KeyS']) {
          this._speed = this._isHide
            ? DESIGN.GAMEPLAY.PLAYER_SPEED / 2
            : DESIGN.GAMEPLAY.PLAYER_SPEED;
          this._velocity.add(
            this._getForwardVector(self).multiplyScalar(
              -this._speed * self.events.delta,
            ),
          );
        }

        if (self.keys['KeyA']) {
          this._speed = this._isHide
            ? DESIGN.GAMEPLAY.PLAYER_SPEED / 2
            : DESIGN.GAMEPLAY.PLAYER_SPEED;
          this._velocity.add(
            this._getSideVector(self).multiplyScalar(
              -this._speed * self.events.delta,
            ),
          );
        }

        if (self.keys['KeyD']) {
          this._speed = this._isHide
            ? DESIGN.GAMEPLAY.PLAYER_SPEED / 2
            : DESIGN.GAMEPLAY.PLAYER_SPEED;
          this._velocity.add(
            this._getSideVector(self).multiplyScalar(
              this._speed * self.events.delta,
            ),
          );
        }

        if (self.keys['Space']) {
          if (!this._isHide && !this._isTired) {
            this._velocity.y = DESIGN.GAMEPLAY.JUMP;
            self.audio.replayHeroSound(Audios.jumpstart);
          }
        }
      }

      this._velocity.addScaledVector(
        this._velocity,
        self.helper.damping(self.events.delta),
      );

      // Steps sound
      if (
        self.keys['KeyW'] ||
        self.keys['KeyS'] ||
        self.keys['KeyA'] ||
        self.keys['KeyD']
      ) {
        this._speed = this._isHide ? 0.5 : this._isRun ? 2 : 1;
        self.audio.setPlaybackRateOnHeroSound(Audios.steps, this._speed);
        self.audio.startHeroSound(Audios.steps);
      }
    } else {
      self.audio.pauseHeroSound(Audios.steps);
      this._velocity.y -= DESIGN.GAMEPLAY.GRAVITY * self.events.delta;
    }

    if (this._collider)
      this._collider.translate(
        this._velocity.clone().multiplyScalar(self.events.delta),
      );

    this._playerCollitions(self);

    if (this._collider && this._collider.end.y < 0) {
      this._collider.end.y = 0;
      this._collider.start.y = DESIGN.GAMEPLAY.PLAYER_HEIGHT;
    }

    if (this._collider) {
      self.camera.position.set(
        this._collider.end.x,
        this._collider.end.y - (!this._isHide ? 0.5 : 1),
        this._collider.end.z,
      );

      // if (scope.world.enemies) scope.world.enemies.setScales(scope);

      this._toruch.position.copy(self.camera.position);
    }

    this._animateWeapon(self);

    if (this._mixer) this._mixer.update(self.events.delta);
  }
}
