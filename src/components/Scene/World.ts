import * as THREE from 'three';

// Types
import type { Group, Mesh } from 'three';
import type { ISelf } from '@/models/modules';
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import type { ILocation, IShot, IUnitInfo } from '@/models/api';

// Constants
import { Names } from '@/utils/constants';

// Modules
import Atmosphere from '@/components/Scene/World/Atmosphere/Atmosphere';
import Players from '@/components/Scene/World/Players';
import NPC from '@/components/Scene/World/Enemies/NPC';
import Shots from '@/components/Scene/World/Weapon/Shots';
import Explosions from '@/components/Scene/World/Weapon/Explosions';
import Bloods from '@/components/Scene/World/Atmosphere/Bloods';
import Octree from '@/components/Scene/World/Math/Octree';

export default class World {
  public name = Names.world;

  private _group!: Group;
  private _pseudo!: Mesh;

  // Modules
  private _athmosphere: Atmosphere;
  private _players: Players;
  private _shots: Shots;
  private _explosions: Explosions;
  private _bloods: Bloods;
  private _npc: NPC;
  private _time = 0;

  constructor() {
    // Modules
    this._athmosphere = new Atmosphere();
    this._players = new Players();
    this._shots = new Shots();
    this._explosions = new Explosions();
    this._bloods = new Bloods();
    this._npc = new NPC();

    this._group = new THREE.Group();
  }

  public init(self: ISelf): void {
    // this._location = self.store.getters['api/locationData'];

    self.assets.GLTFLoader.load('./images/models/ground.glb', (model: GLTF) => {
      self.helper.loaderDispatchHelper(self.store, this.name);

      this._group = model.scene;
      this._group.position.y = -1;

      // Создаем октодерево
      self.octree.fromGraphNode(this._group);

      self.scene.add(this._group);

      // Modules
      this._players.init(self);
      this._npc.init(self);
      this._shots.init(self);
      this._explosions.init(self);
      this._athmosphere.init(self);
      this._bloods.init(self);

      self.render();
      self.helper.loaderDispatchHelper(self.store, this.name, true);
    });
  }

  // Пересоздание октодерева из ближайших игроков и неписей
  private _updateOctree2(self: ISelf): void {
    this._group = new THREE.Group();
    this._getUnits()
      .filter(
        (item) =>
          item.animation !== 'dead' &&
          new THREE.Vector3(
            item.positionX,
            item.positionY,
            item.positionZ,
          ).distanceTo(self.camera.position) < 10,
      )
      .sort(
        (a, b) =>
          new THREE.Vector3(a.positionX, a.positionY, a.positionZ).distanceTo(
            self.camera.position,
          ) -
          new THREE.Vector3(b.positionX, b.positionY, b.positionZ).distanceTo(
            self.camera.position,
          ),
      )
      .slice(0, 5)
      .forEach((unit: IUnitInfo) => {
        this._pseudo = self.scene.getObjectByProperty(
          'uuid',
          unit.pseudo,
        ) as Mesh;
        if (this._pseudo) this._group.add(this._pseudo);
      });
    if (this._group.children.length) {
      self.scene.add(this._group);
      self.octree2 = new Octree();
      self.octree2.fromGraphNode(this._group);
      this._group.remove();
    }
  }

  private _getUnits(): IUnitInfo[] {
    return this._players.getList().concat(this._npc.getList());
  }

  public shot(self: ISelf): IShot {
    return this._players.shot(self);
  }

  public onShot(self: ISelf, shot: IShot): void {
    this._shots.onShot(self, shot);
  }

  public hits(self: ISelf, units: string[]): void {
    this._players.hits(self, units);
    this._bloods.hits(
      self,
      this._getUnits().filter((unit: IUnitInfo) => units.includes(unit.id)),
    );
  }

  public animate(self: ISelf): void {
    this._time += self.events.delta;
    if (this._time > 0.125) {
      this._updateOctree2(self);
      this._time = 0;
    }

    // Animated modules
    this._shots.animate(self, this._getUnits());
    this._players.animate(self);
    this._npc.animate(self);
    this._explosions.animate(self);
    this._athmosphere.animate(self);
    this._bloods.animate(self);
  }
}
