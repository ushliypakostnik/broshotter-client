// Constants
import { Names } from '@/utils/constants';

// Types
import type { Group } from 'three';
import type { ISelf } from '@/models/modules';

// Modules
import Atmosphere from '@/components/Scene/World/Atmosphere/Atmosphere';
import Players from '@/components/Scene/World/Players';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import Octree from '@/components/Scene/World/Math/Octree';

export default class World {
  public name = Names.world;

  private _model!: Group;

  // Modules
  private _athmosphere: Atmosphere;
  private _players: Players;
  private _octree!: Octree;

  constructor() {
    // Scene
    this._octree = new Octree();

    // Modules
    this._athmosphere = new Atmosphere();
    this._players = new Players();
  }

  public init(self: ISelf): void {
    self.assets.GLTFLoader.load(
      `./images/models/${this.name}.glb`,
      (model: GLTF) => {
        self.helper.loaderDispatchHelper(self.store, this.name);

        this._model = self.assets.traverseHelper(self, model).scene;

        model.scene.position.y = -1.1;

        // Создаем октодерево
        this._octree.fromGraphNode(model.scene);

        self.scene.add(model.scene);

        // Modules
        this._athmosphere.init(self);
        this._players.init(self, this._octree);

        self.render();
        self.helper.loaderDispatchHelper(self.store, this.name, true);
      },
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public shot(self: ISelf): void {
    console.log('shot!!! ');
  }

  public animate(self: ISelf): void {
    // Animated modules
    this._athmosphere.animate(self);
    this._players.animate(self);
  }
}
