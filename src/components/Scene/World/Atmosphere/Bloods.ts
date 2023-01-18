import * as THREE from 'three';

// Types
import type { ISelf } from '@/models/modules';
import type { IBlood, IUserOnShot } from '@/models/api';
import type { Mesh } from 'three';

// Constants
import { Textures } from '@/utils/constants';

export default class Bloods {
  private _list: IBlood[];
  private _counter = 0;
  private _blood: Mesh;
  private _bloodClone: Mesh;
  private _number!: number;
  private _number2!: number;
  private _SIZE = 0.1;
  private _MAX = 1.5;
  private _SPEED = 5;

  constructor() {
    this._list = [];
    this._blood = new THREE.Mesh();
    this._bloodClone = new THREE.Mesh();
  }

  public init(self: ISelf): void {
    this._blood = new THREE.Mesh(
      new THREE.SphereGeometry(this._SIZE, 8, 8),
      self.assets.getMaterial(Textures.blood),
    );
  }

  private _addBlood(self: ISelf, user: IUserOnShot): void {
    this._number = self.helper.randomInteger(1, 5);
    for (let n = 0; n < this._number; ++n) {
      ++this._counter;
      this._bloodClone = this._blood.clone();
      this._bloodClone.position.set(
        user.positionX,
        user.positionY + 1.4,
        user.positionZ,
      );
      this._number2 = Math.random() + 0.5;
      this._bloodClone.scale.set(this._number2, this._number2, this._number2);
      this._list.push({
        id: this._counter,
        velocity: new THREE.Vector3(
          Math.random() - 0.5,
          Math.random() - 0.5,
          Math.random() - 0.5,
        ),
        mesh: this._bloodClone.uuid,
        scale: this._number2,
        isOff: false,
      });
      self.scene.add(this._bloodClone);
    }
  }

  private _redrawBlood(self: ISelf, blood: IBlood): void {
    if (!blood.isOff) blood.scale += self.events.delta * this._SPEED;
    else blood.scale -= self.events.delta * this._SPEED;

    if (blood.scale > this._MAX) blood.isOff = true;

    this._bloodClone = self.scene.getObjectByProperty(
      'uuid',
      blood.mesh,
    ) as Mesh;
    blood.velocity.addScaledVector(
      blood.velocity,
      self.helper.damping(self.events.delta / 2.5),
    );
    blood.velocity.y -= self.events.delta / 2;
    this._bloodClone.position.add(
      blood.velocity.clone().multiplyScalar(self.events.delta * 5),
    );

    if (blood.scale >= 0)
      this._bloodClone.scale.set(blood.scale, blood.scale, blood.scale);

    if (blood.scale >= this._MAX) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this._bloodClone.material.opacity = 1;
    } else if (blood.scale < 0) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this._bloodClone.material.opacity = 0;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
    } else this._bloodClone.material.opacity = blood.scale / this._MAX;

    if (blood.scale < 0) {
      this._list = this._list.filter((item) => item.id !== blood.id);
      self.scene.remove(this._bloodClone);
    }
  }

  public hits(self: ISelf, users: IUserOnShot[]): void {
    users.forEach((user: IUserOnShot) => {
      console.log('Bloods blood:', user);
      this._addBlood(self, user);
    });
  }

  public animate(self: ISelf): void {
    // console.log('Bloods: animate');
    this._list.forEach((blood: IBlood) => {
      this._redrawBlood(self, blood);
    });
  }
}
