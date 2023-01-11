import * as THREE from 'three';

// Types
import type { Clock, Group, Object3D, PointLight, Vector3 } from 'three';
import type { ISelf } from '@/models/modules';
import type { IUser, IShot } from '@/models/api';
import type { TResult } from '@/models/utils';

// Constants
import { Names, Audios, Colors, Animations, DESIGN } from '@/utils/constants';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';

// Modules
import Capsule from '@/components/Scene/World/Math/Capsule';

export default class Hero {
  public name = Names.hero;

  private _collider!: Capsule;
  private _position: Vector3;
  private _number!: number;
  private _velocity: Vector3;
  private _direction: Vector3;
  private _direction2: Vector3;
  private _direction3: Vector3;
  private _isOnFloor: boolean;
  private _speed!: number;
  private _result!: TResult;
  private _result2!: TResult;
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
  private _isTired = false;
  private _isOptical = false;
  private _endurance!: number;
  private _enduranceClock!: Clock;
  private _isEnduranceRecoveryStart = false;
  private _enduranceTime = 0;
  private _isFire = false;
  private _isFireOff = false;
  private _fireScale = 0;
  private _target: Vector3;
  private _isNotJump: boolean;
  private _isHide = false;
  private _isHideStore = false;
  private _isRun = false;
  private _isRunStore = false;
  private _isForward = false;
  private _isBackward = false;
  private _isLeft = false;
  private _isRight = false;
  private _isOnHit = false;
  private _isOnHitStore = false;
  private _isOnBodyHit = false;
  private _isGameOver = false;
  private _isEnter = false;

  // Animations
  private _animation!: string;
  private _dead!: Animations;
  private _hide!: Animations;
  private _hideback!: Animations;
  private _hideleft!: Animations;
  private _hideright!: Animations;
  private _hideforward!: Animations;
  private _hit!: Animations;
  private _stand!: Animations;
  private _standforward!: Animations;
  private _standback!: Animations;
  private _standleft!: Animations;
  private _standright!: Animations;
  private _jump!: Animations;
  private _run!: Animations;
  private _firestand!: Animations;
  private _firestandforward!: Animations;
  private _firehide!: Animations;
  private _firehideforward!: Animations;

  constructor() {
    this._position = new THREE.Vector3();
    this._velocity = new THREE.Vector3();
    this._direction = new THREE.Vector3();
    this._direction2 = new THREE.Vector3();
    this._direction3 = new THREE.Vector3();
    this._direction3 = new THREE.Vector3();
    this._isNotJump = true;
    this._isOnFloor = true;
    this._weaponDirection = new THREE.Vector3();
    this._weaponPosition = new THREE.Vector3();
    this._weaponVelocity = new THREE.Vector3();
    this._weaponUpVelocity = new THREE.Vector3();
    this._target = new THREE.Vector3();
    this._enduranceClock = new THREE.Clock();
  }

  private _setCapsule(self: ISelf): void {
    if (!this._isHide) {
      this._collider = new Capsule(
        new THREE.Vector3(
          self.camera.position.x,
          self.camera.position.y,
          self.camera.position.z,
        ),
        new THREE.Vector3(
          self.camera.position.x,
          self.camera.position.y - DESIGN.GAMEPLAY.PLAYER_HEIGHT,
          self.camera.position.z,
        ),
        1,
      );
    } else {
      this._collider = new Capsule(
        new THREE.Vector3(
          self.camera.position.x,
          self.camera.position.y,
          self.camera.position.z,
        ),
        new THREE.Vector3(
          self.camera.position.x,
          self.camera.position.y + DESIGN.GAMEPLAY.PLAYER_HEIGHT / 2,
          self.camera.position.z,
        ),
        1,
      );
    }
  }

  public init(self: ISelf, weapon: Group): void {
    const id = self.store.getters['layout/id'];
    const game = self.store.getters['api/game'];
    if (id && game) {
      const user = game.users.find((player: IUser) => player.id === id);
      if (user && user.directionX && user.directionZ) {
        this._direction.copy(
          new THREE.Vector3(user.directionX, 0, user.directionZ),
        );
      } else
        this._direction.copy(
          new THREE.Vector3(
            DESIGN.GAMEPLAY.START.directionX,
            0,
            DESIGN.GAMEPLAY.START.directionZ,
          ),
        );
    } else
      this._direction.copy(
        new THREE.Vector3(
          DESIGN.GAMEPLAY.START.directionX,
          0,
          DESIGN.GAMEPLAY.START.directionZ,
        ),
      );

    self.camera.lookAt(this._direction.multiplyScalar(1000));

    this._setCapsule(self);
    this._jumpStart = this._collider.end.y;

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

        self.helper.loaderDispatchHelper(self.store, this.name, true);
      },
    );

    // Animations
    this._dead = Animations.dead;
    this._hide = Animations.hide;
    this._hideback = Animations.hideback;
    this._hideleft = Animations.hideleft;
    this._hideright = Animations.hideright;
    this._hideforward = Animations.hideforward;
    this._hit = Animations.hit;
    this._stand = Animations.stand;
    this._standforward = Animations.standforward;
    this._standback = Animations.standback;
    this._standleft = Animations.standleft;
    this._standright = Animations.standright;
    this._jump = Animations.jump;
    this._run = Animations.run;
    this._firestand = Animations.firestand;
    this._firestandforward = Animations.firestandforward;
    this._firehide = Animations.firehide;
    this._firehideforward = Animations.firehideforward;

    this._animation = this._stand;

    // Toruch
    this._toruch = new THREE.PointLight(Colors.toruch, 1.25, 50);
    self.scene.add(this._toruch);

    self.helper.loaderDispatchHelper(self.store, this.name, true);
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

  // Выстрел
  public shot(self: ISelf): IShot {
    self.audio.replayHeroSound(Audios.shot);
    this._isOptical = self.store.getters['layout/isOptical'];

    // Update fire
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
      this._getForwardVector(self).multiplyScalar(-1 * self.events.delta),
    );
    this._weaponUpVelocity.add(
      self.camera
        .getWorldDirection(this._direction)
        .normalize()
        .multiplyScalar(-1 * self.events.delta),
    );

    this._direction3 = this._direction
      .negate()
      .multiplyScalar(DESIGN.GAMEPLAY.SHOTS);

    this._position = this._isOptical
      ? this._optical.position
      : this._weapon.position;
    if (this._isOptical) this._position.y = -0.2;
    if (this._isLeft) this._position.add(this._velocity.normalize().negate().multiplyScalar(0.25));
    else this._position.add(this._velocity.normalize().multiplyScalar(0.25));
    this._number =
      this._isNotJump || this._jumpStart - this._collider.end.y < 1.5
        ? this._position.y
        : this._position.y - 1.5;

    return {
      id: null,
      player: self.store.getters['layout/id'],
      positionX: this._position.x,
      positionY: this._number,
      positionZ: this._position.z,
      startX: this._position.x,
      startY: this._number,
      startZ: this._position.z,
      directionX: this._direction3.x,
      directionY: this._direction3.y,
      directionZ: this._direction3.z,
    };
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

  private _getForwardVector(self: ISelf): Vector3 {
    self.camera.getWorldDirection(this._direction);
    this._direction.y = 0;
    this._direction.normalize();

    return this._direction;
  }

  private _getSideVector(self: ISelf): Vector3 {
    self.camera.getWorldDirection(this._direction);
    this._direction.y = 0;
    this._direction.normalize();
    this._direction.cross(self.camera.up);

    return this._direction;
  }

  private _playerCollitions = (self: ISelf) => {
    if (self.octree) {
      this._result = self.octree.capsuleIntersect(this._collider);
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

      if (this._isNotJump !== this._isOnFloor) {
        if (!this._isOnFloor) this._jumpStart = this._collider.end.y;
        else if (this._jumpStart) {
          this._jumpFinish = this._jumpStart - this._collider.end.y;

          // TODO: Урон от слишком высокого прыжка - допилить!!!
          // if (jumpFinish > 15 && !scope.isNotDamaged) scope.events.heroOnHitDispatchHelper(scope, -2 * (jumpFinish - 15));

          // Sound
          this._is = self.store.getters['layout/isPause'];
          if (Math.abs(this._jumpFinish) > 0.1 && !this._is)
            self.audio.replayHeroSound(Audios.jumpend);
        }
      }
      this._isNotJump = this._isOnFloor;
    }

    if (self.octree2) {
      this._result2 = self.octree2.capsuleIntersect(this._collider);

      if (this._result2) {
        this._collider.translate(
          this._result2.normal.multiplyScalar(this._result2.depth),
        );
      }
    }
  };

  private _redrawFire(self: ISelf) {
    if (!this._isFireOff) this._fireScale += self.events.delta * 50;
    else this._fireScale -= self.events.delta * 50;

    if (this._fireScale > 5) this._isFireOff = true;

    if (!this._isOptical) {
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
    } else {
      if (this._fireScale >= 0)
        this._opticalFire.scale.set(
          this._fireScale / 1.5,
          this._fireScale / 1.5,
          this._fireScale / 1.5,
        );
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
    if (!this._isEnter) this._isEnter = self.store.getters['api/isEnter'];
    else {
      this._endurance = self.store.getters['layout/endurance'];
      this._isHide = self.store.getters['layout/isHide'];
      this._isPause = self.store.getters['layout/isPause'];
      this._isRun = self.store.getters['layout/isRun'];
      this._isTired = self.store.getters['layout/isTired'];
      this._isOnHit = self.store.getters['api/isOnHit'];
      this._isOnBodyHit = self.store.getters['api/isOnBodyHit'];
      this._isGameOver = self.store.getters['layout/isGameOver'];

      if (this._isOnHit !== this._isOnHitStore) {
        if (this._isOnHit && this._isOnBodyHit)
          self.audio.replayHeroSound(Audios.hit);
        this._isOnHitStore = this._isOnHit;
      }

      if (this._isFire) this._redrawFire(self);

      if (this._isHide !== this._isHideStore) {
        this._setCapsule(self);
        this._isHideStore = this._isHide;
      }

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

        if (this._isNotJump)
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

      if (this._isNotJump) {
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

          if (self.keys['KeyW'] && !self.keys['KeyS']) {
            this._isForward = true;
            this._isBackward = false;
            this._isLeft = false;
            this._isRight = false;
          } else if (!self.keys['KeyW'] && self.keys['KeyS']) {
            this._isForward = false;
            this._isBackward = true;
            this._isLeft = false;
            this._isRight = false;
          } else if (self.keys['KeyA'] && !self.keys['KeyD']) {
            this._isForward = false;
            this._isBackward = false;
            this._isLeft = true;
            this._isRight = false;
          } else if (self.keys['KeyD'] && !self.keys['KeyA']) {
            this._isForward = false;
            this._isBackward = false;
            this._isLeft = false;
            this._isRight = true;
          } else {
            this._isForward = false;
            this._isBackward = false;
            this._isLeft = false;
            this._isRight = false;
          }
        } else {
          this._velocity.addScaledVector(
            this._velocity,
            self.helper.damping(self.events.delta),
          );
        }
      } else {
        self.audio.pauseHeroSound(Audios.steps);
        this._velocity.y -= DESIGN.GAMEPLAY.GRAVITY * self.events.delta;
      }

      if (this._isGameOver) this._animation = this._dead;
      else if (!this._isHide && this._isOnHit) this._animation = this._hit;
      else if (!this._isHide && this._isRun !== this._isRunStore) {
        if (this._isRun) this._animation = this._run;
        else this._animation = this._getMove();
        this._isRunStore = this._isRun;
      } else {
        if (!this._isNotJump && !this._isHide && !this._isPause)
          this._animation = this._jump;
        else {
          if (this._isRun && !this._isPause) this._animation = this._run;
          else this._animation = this._getMove();
        }
      }

      if (this._collider) {
        if (this._isGameOver) {
          this._velocity.x = 0;
          this._velocity.z = 0;
        }
        this._collider.translate(
          this._velocity.clone().multiplyScalar(self.events.delta),
        );

        this._playerCollitions(self);

        if (this._collider.end.y < 0) {
          this._collider.end.y = 0;
          this._collider.start.y = DESIGN.GAMEPLAY.PLAYER_HEIGHT;
        }

        self.camera.position.set(
          this._collider.end.x,
          this._collider.end.y -
            (!this._isHide ? 0 : DESIGN.GAMEPLAY.PLAYER_HEIGHT / 1.1),
          this._collider.end.z,
        );

        this._toruch.position.copy(self.camera.position);

        self.camera.getWorldDirection(this._direction);
        this._direction.normalize();

        self.store.dispatch('api/setApiState', {
          field: 'updates',
          value: {
            positionX: self.camera.position.x,
            positionY: self.camera.position.y,
            positionZ: self.camera.position.z,
            directionX: this._direction.x,
            directionY: this._direction.y,
            directionZ: this._direction.z,

            animation: this._animation,
            isFire: this._isFire,
            isOnHit: this._isOnHit && this._isOnBodyHit,
          },
        });

        this._animateWeapon(self);
      }
    }
  }

  private _getMove(): Animations {
    if (this._isHide) {
      if (this._isForward) {
        if (this._isFire) return this._firehideforward;
        else return this._hideforward;
      } else if (this._isBackward) return this._hideback;
      else if (this._isLeft) return this._hideleft;
      else if (this._isRight) return this._hideright;
      else if (this._isFire) return this._firehide;
      else return this._hide;
    } else {
      if (this._isForward) {
        if (this._isFire) return this._firestandforward;
        else return this._standforward;
      } else if (this._isBackward) return this._standback;
      else if (this._isLeft) return this._standleft;
      else if (this._isRight) return this._standright;
    }
    if (this._isFire) return this._firestand;
    return this._stand;
  }
}
