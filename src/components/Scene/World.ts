import * as THREE from 'three';

// Types
import type { Group } from 'three';
import type { ISelf } from '@/models/modules';
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import type { IShot } from '@/models/api';

// Constants
import { Names } from '@/utils/constants';

// Modules
import Atmosphere from '@/components/Scene/World/Atmosphere/Atmosphere';
import Players from '@/components/Scene/World/Players';
import Shots from '@/components/Scene/World/Weapon/Shots';
import Explosions from '@/components/Scene/World/Weapon/Explosions';

export default class World {
  public name = Names.world;

  private _model!: Group;
  private _lenin!: Group;
  private _places!: Group[];

  // Modules
  private _athmosphere: Atmosphere;
  private _players: Players;
  private _shots: Shots;
  private _explosions: Explosions;

  constructor() {
    // Modules
    this._athmosphere = new Atmosphere();
    this._players = new Players();
    this._shots = new Shots();
    this._explosions = new Explosions();

    this._places = [];
    this._lenin = new THREE.Group();
  }

  public init(self: ISelf): void {
    /* self.assets.GLTFLoader.load('./images/models/lenin.glb', (model: GLTF) => {
      self.helper.loaderDispatchHelper(self.store, Names.lenin);

      this._lenin.add(self.assets.traverseHelper(self, model).scene);
      self.scene.add(this._lenin);

      self.render();
    }); */

    self.assets.GLTFLoader.load(
      `./images/models/${this.name}.glb`,
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
        this._athmosphere.init(self);
        this._players.init(self);
        this._shots.init(self);
        this._explosions.init(self);

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

  public animate(self: ISelf): void {
    // Animated modules
    this._athmosphere.animate(self);
    this._players.animate(self);
    this._shots.animate(self, this._players.getList());
    this._explosions.animate(self);
  }
}
