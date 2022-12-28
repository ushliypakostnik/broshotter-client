// Constants
import { Names } from '@/utils/constants';

// Types
import type { ISelf } from '@/models/modules';
import type { Group, AnimationAction } from 'three';
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';

// Modules
import { AnimatedModule } from '@/models/modules';
import { AnimationMixer } from 'three';

export default class Enemies extends AnimatedModule {
  public model!: Group;
  private _mixer!: AnimationMixer;
  private _action!: AnimationAction;

  constructor() {
    super(Names.enemies);
  }

  init(self: ISelf): void {
    self.assets.GLTFLoader.load(
      `./images/models/${this.name}.glb`,
      (model: GLTF) => {
        self.helper.loaderDispatchHelper(self.store, this.name);
        this.model = model.scene;

        this._mixer = new AnimationMixer(this.model);
        this._action = this._mixer.clipAction(model.animations[1]);
        this._action.play();

        this.model.rotation.y = Math.PI / 2;
        this.model.position.set(-2, 0, -2);
        this.model.name = Names.sand;

        self.scene.add(this.model);
        self.render();
      },
    );

    self.helper.loaderDispatchHelper(self.store, this.name, true);
  }

  animate(self: ISelf): void {
    this._mixer.update(self.events.delta);
  }
}
