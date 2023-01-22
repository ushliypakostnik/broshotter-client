import * as THREE from 'three';

// Types
import type { Group, Mesh } from 'three';
import type { ISelf } from '@/models/modules';
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import type {
  ILocation,
  IShot,
  IUnitInfo,
} from '@/models/api';

// Constants
import { Names, DESIGN } from '@/utils/constants';

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

  private _model!: Group;
  private _places!: Group[];
  private _location!: ILocation;
  private _group!: Group;
  private _pseudo!: Mesh;

  // Modules
  private _athmosphere: Atmosphere;
  private _players: Players;
  private _shots: Shots;
  private _explosions: Explosions;
  private _bloods: Bloods;
  private _npc: NPC;

  constructor() {
    // Modules
    this._athmosphere = new Atmosphere();
    this._players = new Players();
    this._shots = new Shots();
    this._explosions = new Explosions();
    this._bloods = new Bloods();
    this._npc = new NPC();

    this._places = [];
    this._group = new THREE.Group();
  }

  public init(self: ISelf): void {
    this._location = self.store.getters['api/locationData'];
    let name = 'empty';
    const isModel = DESIGN.MODELS.find(
      (model: { x: number; y: number }) =>
        model.x === this._location.x && model.y === this._location.y,
    );
    if (isModel)
      name = `location_${this._location.y.toString()}_${this._location.x.toString()}`;

    self.assets.GLTFLoader.load(
      `./images/models/locations/${name}.glb`,
      (model: GLTF) => {
        self.helper.loaderDispatchHelper(self.store, this.name);

        this._model = self.assets.traverseHelper(self, model).scene;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this._model.traverse((child: any) => {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        this._places.forEach((place) => {
          this._model.remove(place);
        });

        this._model.position.y = -1.1;

        // Создаем октодерево
        self.octree.fromGraphNode(this._model);

        self.scene.add(this._model);

        // Modules
        this._players.init(self);
        this._npc.init(self);
        this._shots.init(self);
        this._explosions.init(self);
        this._athmosphere.init(self);
        this._bloods.init(self);

        self.render();
        self.helper.loaderDispatchHelper(self.store, this.name, true);
      },
    );
  }

  // Пересоздание октодерева из всех игроков и неписей
  private _updateOctree2(self: ISelf): void {
    this._group = new THREE.Group();
    this._getUnits().forEach((unit: IUnitInfo) => {
      if (unit.animation !== 'dead' && unit.animation !== 'idle') {
        this._pseudo = self.scene.getObjectByProperty(
          'uuid',
          unit.pseudo,
        ) as Mesh;
        if (this._pseudo) this._group.add(this._pseudo);
      }
    });
    if (this._group.children.length) {
      self.scene.add(this._group);
      self.octree2 = new Octree();
      self.octree2.fromGraphNode(this._group);
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
      this._getUnits().filter((unit: IUnitInfo) =>
        units.includes(unit.id),
      ),
    );
  }

  public animate(self: ISelf): void {
    this._updateOctree2(self);

    // Animated modules
    this._shots.animate(self, this._getUnits());
    this._players.animate(self);
    this._npc.animate(self);
    this._explosions.animate(self);
    this._athmosphere.animate(self);
    this._bloods.animate(self);
  }
}
