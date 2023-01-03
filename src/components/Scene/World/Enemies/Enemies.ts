import * as THREE from 'three';

// Constants
import { Names } from '@/utils/constants';

// Types
import type { ISelf } from '@/models/modules';
import type { Group, AnimationAction, AnimationMixer } from 'three';
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';

export default class Enemies {
  public name = Names.enemies;

  private _model!: Group;
  private _mixer!: AnimationMixer;
  private _action!: AnimationAction;

  public init(self: ISelf, weapon: Group): void {
    self.assets.GLTFLoader.load(
      `./images/models/${this.name}.glb`,
      (model: GLTF) => {
        self.helper.loaderDispatchHelper(self.store, this.name);

        this._model = model.scene;

        this._mixer = new THREE.AnimationMixer(this._model);
        this._action = this._mixer.clipAction(model.animations[1]);
        this._action.play();

        this._model.rotation.y = Math.PI / 2;
        this._model.position.set(-4, 0, -4);
        this._model.name = this.name;

        self.scene.add(this._model);

        self.helper.loaderDispatchHelper(self.store, this.name, true);
      },
    );
  }

  public animate(self: ISelf): void {
    if (this._mixer) this._mixer.update(self.events.delta);
  }
}
