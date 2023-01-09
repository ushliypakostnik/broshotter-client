import * as THREE from 'three';
import { Mesh } from 'three';
// Types
import { ISelf } from '@/models/modules';
import { EmitterEvents, IExplosion, IExplosionThree } from '@/models/api';
// Constants
import { Audios, Textures } from '@/utils/constants';
// Module
import emitter from '@/utils/emitter';

export default class Explosions {
  private _list: IExplosionThree[];
  private _counter = 0;
  private _explosion!: Mesh;
  private _explosionClone: Mesh;
  private _explosionItem!: IExplosionThree;
  private _SIZE = 0.5;
  private _MAX = 3;
  private _SPEED = 25;

  constructor() {
    this._list = [];
    this._explosionClone = new THREE.Mesh();
  }

  public init(self: ISelf): void {
    this._explosion = new THREE.Mesh(
      new THREE.SphereGeometry(this._SIZE, 16, 16),
      self.assets.getMaterial(Textures.fire),
    );

    // Реагировать на ответ на взрыв
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    emitter.on(EmitterEvents.onExplosion, (message: IExplosion) => {
      // console.log('Explosions onExplosion!!!', message);
      ++this._counter;
      this._explosionClone = this._explosion.clone();
      this._explosionClone.position.set(
        message.positionX,
        message.positionY,
        message.positionZ,
      );
      this._list.push({
        ...message,
        id: this._counter,
        mesh: this._explosionClone.uuid,
        scale: 1,
        isOff: false,
      });
      self.scene.add(this._explosionClone);
      self.audio.addAndPlayAudioOnObject(
        self,
        this._explosionClone.uuid,
        self.assets.explosion,
        Audios.explosion,
      );
    });
  }

  private _removeExplosionFromBus(self: ISelf, id: number) {
    this._explosionItem = this._list.find(
      (item) => item.id === id,
    ) as IExplosionThree;
    if (this._explosionItem) {
      this._explosionClone = self.scene.getObjectByProperty(
        'uuid',
        this._explosionItem.mesh,
      ) as Mesh;
      if (this._explosionClone) self.scene.remove(this._explosionClone);
      this._list = this._list.filter((item) => item.id !== id);
    }
  }

  public animate(self: ISelf): void {
    this._list.forEach((record: IExplosionThree) => {
      if (!record.isOff) record.scale += self.events.delta * this._SPEED;
      else record.scale -= self.events.delta * this._SPEED;

      if (record.scale > this._MAX) record.isOff = true;

      this._explosionClone = self.scene.getObjectByProperty(
        'uuid',
        record.mesh,
      ) as Mesh;
      if (this._explosionClone) {
        if (record.scale >= 0)
          this._explosionClone.scale.set(
            record.scale,
            record.scale,
            record.scale,
          );

        if (record.scale >= this._MAX) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          this._explosionClone.material.opacity = 1;
        } else if (record.scale < 0) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          this._explosionClone.material.opacity = 0;
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
        } else this._explosionClone.material.opacity = record.scale / this._MAX;

        this._explosionClone.rotateX(self.events.delta * -3);
        this._explosionClone.rotateY(self.events.delta * -3);
        this._explosionClone.rotateZ(self.events.delta * -3);
      }

      if (record.scale < 0)
        this._removeExplosionFromBus(self, record.id as number);
    });
  }
}
