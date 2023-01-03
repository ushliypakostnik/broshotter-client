import * as THREE from 'three';

// Constants
import { Colors, Names, Textures, DESIGN, OBJECTS } from '@/utils/constants';

// Types
import type {
  Color,
  HemisphereLight,
  Mesh,
  SphereBufferGeometry,
  MeshBasicMaterial,
} from 'three';
import type { ISelf } from '@/models/modules';

export default class Atmosphere {
  public name = Names.atmosphere;

  private _skyGeometry!: SphereBufferGeometry;
  private _skyMaterial!: MeshBasicMaterial;
  private _sky!: Mesh;
  private _light!: HemisphereLight;
  private _sand!: Mesh;
  private _mountain1!: Mesh;
  private _mountain2!: Mesh;

  init(self: ISelf): void {
    // Lights
    this._light = new THREE.HemisphereLight(
      self.scene.background as Color,
      0x295826,
      0.5,
    );

    // Hemisphere
    this._light.position.set(0, DESIGN.SIZE * 2, 0).normalize();
    self.scene.add(this._light);

    // Ambient
    self.scene.add(new THREE.AmbientLight(Colors.white));

    // Sky
    this._skyGeometry = new THREE.SphereBufferGeometry(
      DESIGN.SIZE / 1.75,
      64,
      64,
    );
    // invert the geometry on the x-axis so that all of the faces point inward
    this._skyGeometry.scale(-1, 1, 1);
    this._skyMaterial = self.assets.getMaterial(
      Textures.sky,
    ) as MeshBasicMaterial;
    this._sky = new THREE.Mesh(this._skyGeometry, this._skyMaterial);

    this._sky.rotateX(Math.PI / 4);
    this._sky.rotateY(Math.PI / 6);
    this._sky.rotateZ(Math.PI / 3);

    self.scene.add(this._sky);

    self.helper.map = self.assets.getTexture(Textures.sand);
    self.helper.material = new THREE.MeshStandardMaterial({
      color: Colors.yellow,
      map: self.helper.map,
    });

    // Форма
    self.helper.geometry = new THREE.ConeGeometry(300, 300, 32);
    this._mountain1 = new THREE.Mesh(
      self.helper.geometry,
      self.helper.material,
    );
    self.helper.geometry = new THREE.ConeGeometry(350, 250, 32);
    this._mountain2 = new THREE.Mesh(
      self.helper.geometry,
      self.helper.material,
    );

    this._mountain1.position.x = -600;
    this._mountain1.position.z = 550;
    this._mountain2.position.x = 650;
    this._mountain2.position.z = -550;

    self.scene.add(this._mountain1);
    self.scene.add(this._mountain2);

    // Sand

    self.helper.geometry = new THREE.PlaneBufferGeometry(
      OBJECTS.sand.radius * 10,
      OBJECTS.sand.radius * 10,
      OBJECTS.sand.radius / 10,
      OBJECTS.sand.radius / 10,
    );

    // Искажение
    const vertex = new THREE.Vector3();
    const { position } = self.helper.geometry.attributes;
    for (let i = 0, l = position.count; i < l; i++) {
      vertex.fromBufferAttribute(position, i);

      if (
        self.helper.distance2D(0, 0, vertex.x, vertex.y) >
          OBJECTS.sand.radius / 2 &&
        self.helper.distance2D(0, 0, vertex.x, vertex.y) <
          OBJECTS.sand.radius * 2
      ) {
        vertex.x += Math.random() * self.helper.plusOrMinus() * 2;
        vertex.y += Math.random() * self.helper.plusOrMinus() * 2;
        vertex.z += Math.random() * self.helper.plusOrMinus() * 2;
        vertex.z *= Math.random() * 40;
      }

      position.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }

    this._sand = new THREE.Mesh(self.helper.geometry, self.helper.material);
    this._sand.rotation.x = -Math.PI / 2;
    this._sand.position.set(0, OBJECTS.sand.positionY, 0);
    this._sand.name = Names.sand;
    this._sand.updateMatrix();
    self.scene.add(this._sand);

    self.helper.loaderDispatchHelper(self.store, this.name, true);
  }

  animate(self: ISelf): void {
    if (this._sky) this._sky.rotateY(self.events.delta / 25);
  }
}
