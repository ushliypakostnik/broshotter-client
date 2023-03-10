import * as THREE from 'three';

// Types
import type { ISelf } from '@/models/modules';
import type { IShot, IShotThree, IUserOnShot } from '@/models/api';
import type { Group, Mesh, Vector3 } from 'three';

// Constants
import { DESIGN, Textures } from '@/utils/constants';
import { EmitterEvents } from '@/models/api';

// Module
import emitter from '@/utils/emitter';
import { TResult } from '@/models/utils';
import Octree from '@/components/Scene/World/Math/Octree';

export default class Shots {
  private _list: IShotThree[];
  private _listNew: IShotThree[];
  private _enemies: IUserOnShot[];
  private _ids: number[];
  private _shot!: Mesh;
  private _shotClone: Mesh;
  private _shotItem!: IShotThree;
  private _result!: TResult;
  private _result2!: TResult;
  private _result3!: TResult;
  private _SIZE = 0.1;
  private _is = false;
  private _time = 0;
  private _p1!: Vector3;
  private _p2!: Vector3;
  private _index!: number;
  private _group!: Group;
  private _pseudo!: Mesh;
  private _pseudoClone!: Mesh;
  private _id!: string;

  constructor() {
    this._list = [];
    this._listNew = [];
    this._enemies = [];
    this._ids = [];
    this._shotClone = new THREE.Mesh();
  }

  public init(self: ISelf): void {
    this._shot = new THREE.Mesh(
      new THREE.SphereGeometry(this._SIZE, 8, 8),
      self.assets.getMaterial(Textures.hole),
    );

    // Реагировать на ответ на выстрел
    emitter.on(EmitterEvents.onUnshot, (id) => {
      this._shotItem = this._list.find((item) => item.id === id) as IShotThree;
      if (this._shotItem) {
        this._shotClone = self.scene.getObjectByProperty(
          'uuid',
          this._shotItem.model,
        ) as Mesh;
        if (this._shotClone) self.scene.remove(this._shotClone);
        this._list = this._list.filter((item) => item.id !== id);
      }
    });
  }

  // Ответ на выстрел
  public onShot(self: ISelf, shot: IShot): void {
    // console.log('Shots onShot!!!', shot);
    this._shotClone = this._shot.clone();
    this._shotClone.position.set(
      shot.positionX,
      shot.positionY,
      shot.positionZ,
    );
    // Если это собственный выстрел - скрываем на старте
    if (shot.player === self.store.getters['persist/id'])
      this._shotClone.visible = false;
    this._list.push({
      ...shot,
      model: this._shotClone.uuid,
    });
    self.scene.add(this._shotClone);
  }

  // Удаление выстрела
  private _unshot(id: number): void {
    emitter.emit(EmitterEvents.unshot, id);
  }

  // Взрыв
  private _explosion(shot: IShot, enemy: string): void {
    emitter.emit(EmitterEvents.explosion, { ...shot, enemy });
  }

  // Поиск противника по месту удара
  private _findEnemyOnShot(
    self: ISelf,
    position: Vector3,
    enemies: IUserOnShot[],
  ): string {
    this._enemies = enemies;
    this._enemies.sort((a: IUserOnShot, b: IUserOnShot) => {
      this._p1 = new THREE.Vector3(a.positionX, a.positionY, a.positionZ);
      this._p2 = new THREE.Vector3(b.positionX, b.positionY, b.positionZ);
      return position.distanceTo(this._p1) - position.distanceTo(this._p2);
    });
    this._index = 0;
    while (this._index < this._enemies.length) {
      this._group = new THREE.Group();
      this._pseudo = self.scene.getObjectByProperty(
        'uuid',
        this._enemies[this._index].pseudo,
      ) as Mesh;
      if (this._pseudo) {
        this._pseudoClone = this._pseudo.clone();
        this._group.add(this._pseudo.clone());
      }
      self.scene.add(this._group);
      self.octree3 = new Octree();
      self.octree3.fromGraphNode(this._group);
      this._result3 = self.octree3.sphereIntersect(
        new THREE.Sphere(position, this._SIZE),
      );
      if (this._result3) {
        this._id = this._enemies[this._index].id;
        break;
      }
      ++this._index;
    }
    return this._result3 ? this._id : '';
  }

  public animate(self: ISelf, enemies: IUserOnShot[]): void {
    if (
      self.store.getters['api/game'] &&
      self.store.getters['api/game'].shots &&
      (self.store.getters['api/game'].shots.length || this._list.length)
    ) {
      this._is = false;
      this._time += self.events.delta;
      if (this._time > 1) {
        this._is = true;
        this._time = 0;
      }

      this._listNew = self.store.getters['api/game'].shots;
      if (this._is) this._ids = [];
      this._listNew.forEach((shot) => {
        if (this._is) this._ids.push(shot.id as number);
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        this._shotItem = this._list.find((item) => item.id === shot.id);
        if (this._shotItem && this._shotItem.model) {
          this._shotClone = self.scene.getObjectByProperty(
            'uuid',
            this._shotItem.model,
          ) as Mesh;
          this._shotClone.position.set(
            shot.positionX,
            shot.positionY,
            shot.positionZ,
          );

          // Делаем выстрел игрока видимым при небольшом отлете
          if (
            shot.player === self.store.getters['persist/id'] &&
            !this._shotClone.visible &&
            this._shotClone.position.distanceTo(
              new THREE.Vector3(shot.startX, shot.startY, shot.startZ),
            ) > 3
          )
            this._shotClone.visible = true;

          // Проверяем столкновения собственных выстрелов с миром и другими игроками
          if (shot.player === self.store.getters['persist/id']) {
            // С миром только если отлетел на 3 метра
            this._result =
              this._shotClone.visible &&
              self.octree.sphereIntersect(
                new THREE.Sphere(this._shotClone.position, this._SIZE),
              );
            this._result2 = self.octree2.sphereIntersect(
              new THREE.Sphere(this._shotClone.position, this._SIZE),
            );
            this._id = '';
            if (this._result2)
              this._id = this._findEnemyOnShot(
                self,
                this._shotClone.position,
                enemies,
              );
            if (this._result || this._result2) this._explosion(shot, this._id);
          }
          // Сносим выстрел если он улетел за пределы локации
          else if (
            shot.player === self.store.getters['persist/id'] &&
            this._shotClone.position.distanceTo(new THREE.Vector3(0, 0, 0)) >
              DESIGN.SIZE * 2
          )
            this._unshot(shot.id as number);
          // Если ушел под пол или улетел слишком высоко
          else if (
            shot.player === self.store.getters['persist/id'] &&
            (this._shotClone.position.y < 0 ||
              this._shotClone.position.y > DESIGN.SIZE * 1.5)
          )
            this._unshot(shot.id as number);
        }
      });

      if (this._is)
        this._list = this._list.filter((shot) =>
          this._ids.includes(shot.id as number),
        );
    }
  }
}
