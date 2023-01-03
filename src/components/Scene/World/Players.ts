// Constants
import { Names } from '@/utils/constants';

// Types
import type { ISelf } from '@/models/modules';
import type { Group } from 'three';
import type Octree from '@/components/Scene/World/Math/Octree';
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';

// Modules
import Hero from '@/components/Scene/World/Hero/Hero';
import Enemies from '@/components/Scene/World/Enemies/Enemies';

export default class Players {
  public name = Names.players;

  private _model!: Group;

  // Modules
  private _hero: Hero;
  private _enemies: Enemies;

  constructor() {
    // Modules
    this._hero = new Hero();
    this._enemies = new Enemies();
  }

  public init(self: ISelf, octree: Octree): void {
    self.assets.GLTFLoader.load(
      `./images/models/${this.name}.glb`,
      (model: GLTF) => {
        self.helper.loaderDispatchHelper(self.store, this.name);

        this._model = self.assets.traverseHelper(self, model).scene;
        this._model.scale.set(0.05, 0.05, 0.05);

        // Modules
        this._hero.init(self, octree, this._model);
        this._enemies.init(self, this._model);

        self.render();
        self.helper.loaderDispatchHelper(self.store, this.name, true);
      },
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public animate(self: ISelf): void {
    // Animated modules
    this._hero.animate(self);
    this._enemies.animate(self);
  }
}
