// Types
import type { ISelf } from '@/models/modules';
import type { Group } from 'three';
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { IShot, IUserOnShot } from '@/models/api';

// Constants
import { Names } from '@/utils/constants';

// Modules
import Hero from '@/components/Scene/World/Hero/Hero';
import Enemies from '@/components/Scene/World/Enemies/Enemies';

export default class Players {
  public name = Names.players;

  private _model!: Group;

  // Modules
  private _enemies: Enemies;
  private _hero: Hero;

  constructor() {
    // Modules
    this._enemies = new Enemies();
    this._hero = new Hero();
  }

  public init(self: ISelf): void {
    self.assets.GLTFLoader.load(
      `./images/models/${this.name}.glb`,
      (model: GLTF) => {
        self.helper.loaderDispatchHelper(self.store, this.name);

        this._model = self.assets.traverseHelper(self, model).scene;
        this._model.scale.set(0.05, 0.05, 0.05);

        // Modules
        this._enemies.init(self, this._model);
        this._hero.init(self, this._model);

        self.render();
        self.helper.loaderDispatchHelper(self.store, this.name, true);
      },
    );
  }

  public shot(self: ISelf): IShot {
    return this._hero.shot(self);
  }

  public hits(self: ISelf, users: string[]) {
    this._enemies.hits(self, users);
  }

  public getList(): IUserOnShot[] {
    return this._enemies.getList();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public animate(self: ISelf): void {
    // Animated modules
    this._hero.animate(self);
    this._enemies.animate(self);
  }
}
