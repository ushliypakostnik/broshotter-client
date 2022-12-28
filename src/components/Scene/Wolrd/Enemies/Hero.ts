// Constants
import { Names } from '@/utils/constants';

// Types
import type { ISelf } from '@/models/modules';
import type { Group, AnimationAction } from 'three';
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';

// Modules
import { AnimatedModule } from '@/models/modules';
import { AnimationMixer } from 'three';

export default class Hero extends AnimatedModule {
  public model!: Group;
  private _mixer!: AnimationMixer;
  private _action!: AnimationAction;

  constructor() {
    super(Names.enemies);
  }

  init(self: ISelf): void {
    self.helper.loaderDispatchHelper(self.store, this.name, true);
  }

  animate(self: ISelf): void {
    this._mixer.update(self.events.delta);
  }
}
