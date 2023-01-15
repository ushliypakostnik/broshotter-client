// Types
import * as THREE from 'three';

import type {
  AmbientLight,
  Color,
  DirectionalLight,
  Group,
  HemisphereLight,
  Mesh,
  SphereBufferGeometry,
  Texture
} from 'three';
import type { ISelf } from '@/models/modules';
import type { ILocation, ITree, ITreeScene } from '@/models/api';

// Constants
import { Colors, Names, Textures, DESIGN } from '@/utils/constants';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';

export default class Atmosphere {
  public name = Names.atmosphere;

  private _skyGeometry!: SphereBufferGeometry;
  private _sky!: Mesh;
  private _light!: HemisphereLight;
  private _sun!: DirectionalLight;
  private _ground!: Mesh;
  private _ground2!: Mesh;
  private _model!: Group;
  private _modelClone!: Group;
  private _trees: ITreeScene[] = [];
  private _ambient!: AmbientLight;
  private _index!: number;
  private _time = 0;
  private _randomX!: number;
  private _randomY!: number;
  private _randomZ!: number;
  private _rotateX = 0;
  private _rotateY = 0;
  private _rotateZ = 0;
  private _direction = 1;
  private _direction2!: boolean;
  private _isFirst = false;
  private _location!: ILocation;
  private _number!: number;

  // Освещение - "время суток"
  private _DAY = [
    {
      ambient: 0xf885a6,
      fog: 0xc43b9f,
      intensity: 0.5,
      sun: 0.6,
      mode: 'day',
    },
    {
      ambient: 0xf554e9,
      fog: 0xd35cbc,
      intensity: 0.6,
      sun: 0.725,
      mode: 'day',
    },
    {
      ambient: 0xf99c7b,
      fog: 0xea8395,
      intensity: 0.7,
      sun: 0.85,
      mode: 'day',
    },
    {
      ambient: 0xffffff,
      fog: 0xffffff,
      intensity: 0.8,
      sun: 1,
      mode: 'day',
    },
    {
      ambient: 0xb2c5cc,
      fog: 0x92cbd2,
      intensity: 0.7,
      sun: 0.9,
      mode: 'day',
    },
    {
      ambient: 0x8492a7,
      fog: 0x688ec5,
      intensity: 0.6,
      sun: 0.6,
      mode: 'day',
    },
    {
      ambient: 0x57618f,
      fog: 0x414cb1,
      intensity: 0.5,
      sun: 0.5,
      mode: 'day',
    },
    {
      ambient: 0x2902ad,
      fog: 0x4338c7,
      intensity: 0.4,
      sun: 0.4,
      mode: 'night',
    },
    {
      ambient: 0x3b5696,
      fog: 0x428797,
      intensity: 0.3,
      sun: 0.3,
      mode: 'night',
    },
    {
      ambient: 0x356c7a,
      fog: 0x2ca085,
      intensity: 0.15,
      sun: 0.15,
      mode: 'night',
    },
    {
      ambient: 0x42606d,
      fog: 0x25572d,
      intensity: 0.05,
      sun: 0.05,
      mode: 'night',
    },
    {
      ambient: 0x000000,
      fog: 0x000000,
      intensity: 0,
      sun: 0,
      mode: 'night',
    },
    {
      ambient: 0x6b6211,
      fog: 0x62391c,
      intensity: 0.5,
      sun: 0.1,
      mode: 'night',
    },
    {
      ambient: 0xac560c,
      fog: 0xfa6e05,
      intensity: 0.2,
      sun: 0.25,
      mode: 'night',
    },
    {
      ambient: 0xf65552,
      fog: 0xe04b44,
      intensity: 0.3,
      sun: 0.4,
      mode: 'night',
    },
    {
      ambient: 0xf00f42,
      fog: 0xdc234d,
      intensity: 0.4,
      sun: 0.5,
      mode: 'day',
    },
  ];

  public init(self: ISelf): void {
    this._index = self.store.getters['persist/day'];
    this._location = self.store.getters['api/locationData'];

    self.store.dispatch('persist/setPersistState', {
      field: 'day',
      value: this._index === this._DAY.length - 1 ? 0 : this._index + 1,
    });

    // Lights

    // Ambient
    this._ambient = new THREE.AmbientLight(this._DAY[this._index].ambient);
    self.scene.add(this._ambient);

    // Hemisphere
    this._light = new THREE.HemisphereLight(
      self.scene.background as Color,
      0xd52a9e,
      this._DAY[this._index].intensity,
    );
    this._light.position.set(0, DESIGN.SIZE * 2, 0).normalize();
    self.scene.add(this._light);

    // Fog
    self.scene.fog = new THREE.Fog(
      this._DAY[this._index].fog,
      DESIGN.SIZE / 10,
      DESIGN.SIZE * 3,
    );

    // Sun
    this._sun = new THREE.DirectionalLight(
      Colors.sun,
      this._DAY[this._index].sun,
    );
    this._sun.position.x = 0;
    this._sun.position.z = 0;
    this._sun.position.y = DESIGN.SIZE * 2;
    this._sun.castShadow = true;

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
    const folder = this._DAY[this._index].mode === 'day' ? 'day' : 'night';
    const number = self.helper.randomInteger(1, 5);
    self.assets.textureLoader.load(`./images/textures/${folder}/${folder + number}.jpg`, (map: Texture) => {
      self.helper.loaderLocationDispatchHelper(self.store, Textures.sky);

      this._number = self.assets.getRepeatByName(Textures.sky);
      map.repeat.set(this._number, this._number);
      map.wrapS = map.wrapT = THREE.RepeatWrapping;
      map.encoding = THREE.sRGBEncoding;

      this._skyGeometry = new THREE.SphereBufferGeometry(DESIGN.SIZE * 2, 64, 64);
      // invert the geometry on the x-axis so that all of the faces point inward
      this._skyGeometry.scale(-1, 1, 1);
      this._sky = new THREE.Mesh(this._skyGeometry,
        new THREE.MeshStandardMaterial({
          map,
          color: Colors.sky,
        }),
      );

      this._sky.rotateX(Math.PI / 4);
      this._sky.rotateY(Math.PI / 6);
      this._sky.rotateZ(Math.PI / 3);

      self.scene.add(this._sky);

      self.helper.loaderLocationDispatchHelper(self.store, Textures.sky, true);
    });

    // Ground
    self.assets.textureLoader.load(`./images/textures/ground/${this._location.ground}.jpg`, (map: Texture) => {
      self.helper.loaderLocationDispatchHelper(self.store, Textures.ground);

      this._number = self.assets.getRepeatByName(Textures.ground);
      map.repeat.set(this._number, this._number);
      map.wrapS = map.wrapT = THREE.RepeatWrapping;
      map.encoding = THREE.sRGBEncoding;

      // Ground 1

      this._ground = new THREE.Mesh(
        new THREE.PlaneBufferGeometry(DESIGN.SIZE * 2, DESIGN.SIZE * 2, 32, 32),
        new THREE.MeshStandardMaterial({
          map,
          color: Colors.yellowDark,
        }),
      );
      this._ground.rotation.x = -Math.PI / 2;
      this._ground.position.set(0, -1.5, 0);
      this._ground.receiveShadow = true;

      self.scene.add(this._ground);

      // Ground 2

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
          self.helper.distance2D(0, 0, vertex.x, vertex.y) > DESIGN.SIZE * 1 &&
          self.helper.distance2D(0, 0, vertex.x, vertex.y) < DESIGN.SIZE * 2
        ) {
          vertex.x += Math.random() * self.helper.plusOrMinus() * 2;
          vertex.y += Math.random() * self.helper.plusOrMinus() * 2;
          vertex.z += Math.random() * self.helper.plusOrMinus() * 2;
          vertex.z *= Math.random() * 10;
        }

        position.setXYZ(i, vertex.x, vertex.y, vertex.z);
      }

      this._ground2 = new THREE.Mesh(
        self.helper.geometry,
        new THREE.MeshStandardMaterial({
          map: map,
          color: this._DAY[this._index].ambient,
        }),
      );
      this._ground2.rotation.x = -Math.PI / 2;
      this._ground2.position.set(0, -1.6, 0);
      this._ground2.updateMatrix();

      self.scene.add(this._ground2);

      self.render();

      self.helper.loaderLocationDispatchHelper(self.store, Textures.ground, true);
    });

    // Trees
    self.assets.GLTFLoader.load('./images/models/tree.glb', (model: GLTF) => {
      self.helper.loaderLocationDispatchHelper(self.store, Names.trees);

      this._model = model.scene;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this._model.traverse((child: any) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (child.isMesh) {
          child.castShadow = true;
        }
      });
      this._model.castShadow = true;

      this._location.trees.forEach((tree: ITree) => {
        this._modelClone = this._model.clone();
        this._modelClone.position.set(tree.x, -3, tree.z);
        this._modelClone.scale.set(tree.scale, tree.scale, tree.scale);
        this._modelClone.rotateX(self.helper.degreesToRadians(tree.rotateX));
        this._modelClone.rotateY(self.helper.degreesToRadians(tree.rotateY));
        this._modelClone.rotateZ(self.helper.degreesToRadians(tree.rotateZ));

        this._trees.push({
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          model: this._modelClone,
          rotate: 1,
        });
        self.scene.add(this._modelClone);
      });

      self.helper.loaderLocationDispatchHelper(self.store, Names.trees, true);
    });

    this._setRandom(self);
    this._direction2 = self.helper.yesOrNo();

    self.helper.loaderLocationDispatchHelper(self.store, this.name, true);
  }

  private _setRandom(self: ISelf) {
    this._randomX = self.helper.randomInteger(1, 5);
    this._randomY = self.helper.randomInteger(1, 5);
    this._randomZ = self.helper.randomInteger(1, 5);

    this._trees.forEach((tree) => {
      tree.rotate = self.helper.randomInteger(1, 5);
    });
  }

  public animate(self: ISelf): void {
    this._time += self.events.delta;

    if (this._sky) this._sky.rotateY(self.events.delta / 25);

    if (this._trees.length) {
      if (this._time > 1) {
        this._direction = this._direction * -1;
        if (!this._isFirst) this._isFirst = true;
        if (this._direction === 1) this._setRandom(self);
        this._time = 0;
      }

      this._trees.forEach((tree) => {
        this._rotateX =
          ((this._randomX * this._direction * (this._isFirst ? 2 : 1)) / 20) *
          self.helper.damping(self.events.delta) *
          tree.rotate;
        this._rotateY =
          ((this._randomY * this._direction * (this._isFirst ? 2 : 1)) / 20) *
          self.helper.damping(self.events.delta) *
          tree.rotate;
        this._rotateZ =
          ((this._randomZ * this._direction * (this._isFirst ? 2 : 1)) / 20) *
          self.helper.damping(self.events.delta) *
          tree.rotate;
        tree.model.rotateX(self.helper.degreesToRadians(this._rotateX));
        tree.model.rotateY(self.helper.degreesToRadians(this._rotateY));
        tree.model.rotateZ(self.helper.degreesToRadians(this._rotateZ));
      });
    }
  }
}
