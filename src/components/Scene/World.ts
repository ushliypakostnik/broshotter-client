// Constants
import { Names } from '@/utils/constants';

// Types
import type { ISelf, IAnimatedModule, IStaticModule } from '@/models/modules';

// Modules
import { AnimatedModule } from '@/models/modules';
import Atmosphere from '@/components/Scene/Wolrd/Atmosphere/Atmosphere';
import Enemies from '@/components/Scene/Wolrd/Enemies/Enemies';

class World extends AnimatedModule {
  // Modules
  private _athmosphere: IStaticModule;
  private _enemies: IAnimatedModule;

  constructor() {
    super(Names.world);

    // Modules
    this._athmosphere = new Atmosphere();
    this._enemies = new Enemies();
  }

  public init(self: ISelf): void {
    // Modules
    this._athmosphere.init(self);
    this._enemies.init(self);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public animate(self: ISelf): void {
    // Animated modules
    this._enemies.animate(self);
  }
}

export default World;
