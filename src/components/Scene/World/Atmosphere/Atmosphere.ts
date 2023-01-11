// Types
import * as THREE from 'three';
import {
  Color,
  DirectionalLight,
  Group,
  HemisphereLight,
  Mesh,
  MeshBasicMaterial,
  SphereBufferGeometry,
} from 'three';
import { ISelf } from '@/models/modules';
import { TPosition, TPositions } from '@/models/utils';

// Constants
import { Colors, DESIGN, Names, Textures } from '@/utils/constants';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';

export default class Atmosphere {
  public name = Names.atmosphere;

  private _skyGeometry!: SphereBufferGeometry;
  private _skyMaterial!: MeshBasicMaterial;
  private _sky!: Mesh;
  private _light!: HemisphereLight;
  private _sun!: DirectionalLight;
  private _sand!: Mesh;
  private _sand2!: Mesh;
  private _model!: Group;
  private _modelClone!: Group;
  private _position!: TPosition;
  private _positions!: TPositions;
  private _scale!: number;
  private _rotate!: number;

  init(self: ISelf): void {
    // Lights
    // Ambient
    // self.scene.add(new THREE.AmbientLight(0x111111));

    this._light = new THREE.HemisphereLight(
      self.scene.background as Color,
      0x295826,
      0.8,
    );

    // Night
    // @ts-ignore
    self.scene.background = 0x000000;
    self.scene.fog = new THREE.Fog(
      Colors.metall,
      DESIGN.SIZE / 10,
      DESIGN.SIZE * 3,
    );
    this._light = new THREE.HemisphereLight(
      self.scene.background as Color,
      0x000000,
      0.8,
    );

    // Hemisphere
    this._light.position.set(0, DESIGN.SIZE, 0).normalize();
    self.scene.add(this._light);

    // Sun
    this._sun = new THREE.DirectionalLight(Colors.sun, 1.2);
    this._sun.position.x = 0;
    this._sun.position.z = 0;
    this._sun.position.y = DESIGN.SIZE;
    this._sun.castShadow = true;

    // Night
    // @ts-ignore
    this._sun.color = new THREE.Color(0xffffff);
    this._sun.intensity = 0.1;

    this._sun.shadow.mapSize.width = 2048;
    this._sun.shadow.mapSize.height = 2048;

    this._sun.shadow.camera.left = -200;
    this._sun.shadow.camera.right = 200;
    this._sun.shadow.camera.top = 200;
    this._sun.shadow.camera.bottom = -200;

    this._sun.shadow.camera.far = 3500;
    this._sun.shadow.camera.near = 1;
    this._sun.shadow.bias = -0.0001;

    self.scene.add(this._sun);

    // Sky
    this._skyGeometry = new THREE.SphereBufferGeometry(DESIGN.SIZE * 2, 64, 64);
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

    // Sand 1

    this._sand = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(DESIGN.SIZE * 2, DESIGN.SIZE * 2, 32, 32),
      self.assets.getMaterial(Textures.sand),
    );
    this._sand.rotation.x = -Math.PI / 2;
    this._sand.position.set(0, -1.5, 0);
    this._sand.receiveShadow = true;
    self.scene.add(this._sand);

    // Sand 2

    self.helper.geometry = new THREE.PlaneBufferGeometry(
      DESIGN.SIZE * 4,
      DESIGN.SIZE * 4,
      32,
      32,
    );

    // Искажение
    const vertex = new THREE.Vector3();
    const { position } = self.helper.geometry.attributes;
    for (let i = 0, l = position.count; i < l; i++) {
      vertex.fromBufferAttribute(position, i);

      if (
        self.helper.distance2D(0, 0, vertex.x, vertex.y) > DESIGN.SIZE * 1.5 &&
        self.helper.distance2D(0, 0, vertex.x, vertex.y) < DESIGN.SIZE * 2
      ) {
        vertex.x += Math.random() * self.helper.plusOrMinus() * 2;
        vertex.y += Math.random() * self.helper.plusOrMinus() * 2;
        vertex.z += Math.random() * self.helper.plusOrMinus() * 2;
        vertex.z *= Math.random() * 10;
      }

      position.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }

    this._sand2 = new THREE.Mesh(
      self.helper.geometry,
      self.assets.getMaterialWithColor(Textures.sand, Colors.sky),
    );
    this._sand2.rotation.x = -Math.PI / 2;
    this._sand2.position.set(0, -1.6, 0);
    this._sand2.updateMatrix();
    self.scene.add(this._sand2);

    // Trees
    self.assets.GLTFLoader.load('./images/models/tree.glb', (model: GLTF) => {
      self.helper.loaderDispatchHelper(self.store, Names.tree);

      this._model = model.scene;
      this._model.traverse((child: any) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (child.isMesh) {
          child.castShadow = true;
        }
      });
      this._model.castShadow = true;

      this._positions = [];
      for (let n = 0; n < 20; ++n) {
        this._position = self.helper.getUniqueRandomPosition(
          this._positions,
          0,
          0,
          20,
          DESIGN.SIZE * 0.5,
          true,
        );
        this._positions.push(this._position);

        this._modelClone = this._model.clone();
        this._modelClone.position.set(this._position.x, -3, this._position.z);
        this._scale = self.helper.randomInteger(-0.5, 45);
        this._modelClone.scale.set(this._scale, this._scale, this._scale);
        this._rotate = self.helper.degreesToRadians(
          self.helper.randomInteger(-1, 360),
        );
        this._modelClone.rotateY(this._rotate);
        this._rotate = self.helper.degreesToRadians(
          self.helper.randomInteger(-1, 15),
        );
        this._modelClone.rotateX(this._rotate);
        this._rotate = self.helper.degreesToRadians(
          self.helper.randomInteger(-1, 15),
        );
        this._modelClone.rotateZ(this._rotate);

        self.scene.add(this._modelClone);
      }
    });

    self.helper.loaderDispatchHelper(self.store, this.name, true);
  }

  animate(self: ISelf): void {
    if (this._sky) this._sky.rotateY(self.events.delta / 25);
  }
}
