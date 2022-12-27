// import * as THREE from 'three';

/*
// Constants
import { Names } from '@/utils/constants';

// Types
import type { ISelf } from '@/models/modules';
import type { Group, AnimationAction } from 'three';

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
    self.assets.FBXLoader.load(
      `./images/models/${this.name}.fbx`,
      (model: Group) => {
        self.helper.loaderDispatchHelper(self.store, this.name);
        this.model = model;

        this._mixer = new AnimationMixer(this.model);
        this._action = this._mixer.clipAction(this.model.animations[0]);
        this._action.play();

        this.model.rotation.y = -Math.PI / 2;
        this.model.scale.x = 0.01;
        this.model.scale.y = 0.01;
        this.model.scale.z = 0.01;
        this.model.position.set(2, 0, 0);
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
*/

// import * as THREE from 'three';

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

        /*
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.model.traverse((child: any) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
       */

        this.model.rotation.y = Math.PI / 2;
        this.model.position.set(2, 0, 0);
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
