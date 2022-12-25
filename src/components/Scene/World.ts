// Constants
import { Names } from '@/utils/constants';

// Types
import type { ISelf, ISimpleModule } from '@/models/modules';

// Modules
import { AnimatedModule } from '@/models/modules';
import Atmosphere from '@/components/Scene/Wolrd/Atmosphere/Atmosphere';

class World extends AnimatedModule {
  // Modules
  private _athmosphere: ISimpleModule;

  constructor() {
    super(Names.world);

    // Modules
    this._athmosphere = new Atmosphere();
  }

  public init(self: ISelf): void {
    // Modules
    this._athmosphere.init(self);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public animate(self: ISelf): void {
    // Animated modules
  }
}

export default World;
