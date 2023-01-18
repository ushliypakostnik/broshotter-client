// Types
import type { Group } from 'three';
import type { ISelf } from '@/models/modules';
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import type { ILocation, IShot, IUserOnShot } from '@/models/api';

// Constants
import { Names, DESIGN } from '@/utils/constants';

// Modules
import Atmosphere from '@/components/Scene/World/Atmosphere/Atmosphere';
import Players from '@/components/Scene/World/Players';
import Shots from '@/components/Scene/World/Weapon/Shots';
import Explosions from '@/components/Scene/World/Weapon/Explosions';
import Bloods from '@/components/Scene/World/Atmosphere/Bloods';

export default class World {
  public name = Names.world;

  private _model!: Group;
  private _places!: Group[];
  private _location!: ILocation;

  // Modules
  private _athmosphere: Atmosphere;
  private _players: Players;
  private _shots: Shots;
  private _explosions: Explosions;
  private _bloods: Bloods;

  constructor() {
    // Modules
    this._athmosphere = new Atmosphere();
    this._players = new Players();
    this._shots = new Shots();
    this._explosions = new Explosions();
    this._bloods = new Bloods();

    this._places = [];
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

          /*
          if (child.name === 'lenin') {
            this._lenin.position.set(
              child.position.x,
              child.position.y,
              child.position.z,
            );
            this._places.push(child);
          } */
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
        this._shots.init(self);
        this._explosions.init(self);
        this._athmosphere.init(self);
        this._bloods.init(self);

        self.render();
        self.helper.loaderDispatchHelper(self.store, this.name, true);
      },
    );
  }

  public shot(self: ISelf): IShot {
    return this._players.shot(self);
  }

  public onShot(self: ISelf, shot: IShot): void {
    this._shots.onShot(self, shot);
  }

  public hits(self: ISelf, users: string[]): void {
    this._players.hits(self, users);
    this._bloods.hits(
      self,
      this._players
        .getList()
        .filter((player: IUserOnShot) => users.includes(player.id)),
    );
  }

  public animate(self: ISelf): void {
    // Animated modules
    this._players.animate(self);
    this._shots.animate(self, this._players.getList());
    this._explosions.animate(self);
    this._athmosphere.animate(self);
    this._bloods.animate(self);
  }
}
