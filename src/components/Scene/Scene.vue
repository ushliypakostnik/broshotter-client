<template>
  <div id="scene" class="scene" />
</template>

<script lang="ts">
import { defineComponent, onMounted, computed, watch, reactive } from 'vue';
import { useStore } from 'vuex';
import { key } from '@/store';

import * as THREE from 'three';

// Constants
import { Colors, DESIGN } from '@/utils/constants';

// Types
import type { ISelf, KeysState } from '@/models/modules';
import type {
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
  AudioListener,
} from 'three';

// Modules
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';
import Helper from '@/utils/helper';
import Assets from '@/utils/assets';
import Events from '@/utils/events';
import AudioBus from '@/utils/audio';
import World from '@/components/Scene/World';

// Stats
import Stats from 'three/examples/jsm/libs/stats.module';

export default defineComponent({
  name: 'Scene',

  setup() {
    const store = useStore(key);

    // Core

    let container: HTMLElement;

    let camera: PerspectiveCamera = new THREE.PerspectiveCamera();
    let listener: AudioListener = new THREE.AudioListener();

    let scene: Scene = new THREE.Scene();

    let renderer: WebGLRenderer = new THREE.WebGLRenderer({
      antialias: true,
    });

    // let clock: Clock = new THREE.Clock();
    // let delta: number;

    // Controls
    let controls: PointerLockControls = new PointerLockControls(
      camera,
      renderer.domElement,
    );

    // Helpers
    let helper: Helper = new Helper();
    let assets: Assets = new Assets();
    let events: Events = new Events();
    let audio: AudioBus = new AudioBus();

    // Modules
    let world = new World();

    // Functions
    let init: () => void;
    let animate: () => void;
    let render: () => void;
    let onWindowResize: () => void;
    let onKeyDown: (event: KeyboardEvent) => void;
    let onKeyUp: (event: KeyboardEvent) => void;
    let onMouseDown: (event: MouseEvent) => void;
    let onMouseUp: (event: MouseEvent) => void;

    // Store getters
    const hero = computed(() => store.getters['api/hero']);
    const isGame = computed(() => store.getters['layout/isGame']);
    const isGameOver = computed(() => store.getters['layout/isGameOver']);
    const isPause = computed(() => store.getters['layout/isPause']);
    const isOptical = computed(() => store.getters['layout/isOptical']);
    const isHide = computed(() => store.getters['layout/isHide']);
    const isRun = computed(() => store.getters['layout/isRun']);

    // Utils
    const keys: KeysState = reactive({});

    // Stats
    let stats = Stats();

    // Go!
    init = () => {
      // Core
      container = document.getElementById('scene') as HTMLElement;

      // Camera
      camera = new THREE.PerspectiveCamera(
        DESIGN.CAMERA.fov,
        container.clientWidth / container.clientHeight,
        0.1,
        DESIGN.SIZE * 0.75,
      );

      // Audio listener
      camera.add(listener);

      // Scene
      scene.background = new THREE.Color(Colors.sky);
      scene.fog = new THREE.Fog(
        DESIGN.CAMERA.fog,
        DESIGN.SIZE / 100,
        DESIGN.SIZE * 0.75,
      );
      self.scene = scene;
      self.render = render;

      // Renderer
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.shadowMap.enabled = false;
      // renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      container.appendChild(renderer.domElement);

      // Controls
      controls = new PointerLockControls(camera, renderer.domElement);
      controls.addEventListener('unlock', () => {
        store.dispatch('layout/setLayoutState', {
          field: 'isPause',
          value: true,
        });
      });
      scene.add(controls.getObject());

      // Listeners
      window.addEventListener('resize', onWindowResize, false);
      document.addEventListener('keydown', (event) => onKeyDown(event), false);
      document.addEventListener('keyup', (event) => onKeyUp(event), false);
      document.addEventListener(
        'mousedown',
        (event) => onMouseDown(event),
        false,
      );
      document.addEventListener('mouseup', (event) => onMouseUp(event), false);

      // Modules
      assets.init(self);
      audio.init(self);
      world.init(self);

      container.appendChild(stats.dom);

      // First render
      onWindowResize();
    };

    // Клавиша клавиатуры нажата
    onKeyDown = (event) => {
      keys[event.code] = true;
      switch (event.keyCode) {
        default:
          break;
      }
    };

    // Клавиша клавиатуры отпущена
    onKeyUp = (event) => {
      keys[event.code] = false;
      switch (event.keyCode) {
        case 16: // Shift
          if (!isPause.value && isRun.value)
            store.dispatch('layout/setLayoutState', {
              field: 'isRun',
              value: false,
            });
          break;

        case 80: // P
          if (isGame.value && !isGameOver.value)
            store.dispatch('layout/setLayoutState', {
              field: 'isPause',
              value: !isPause.value,
            });
          break;

        case 67: // C
        case 18: // Alt
          store.dispatch('layout/setLayoutState', {
            field: 'isHide',
            value: !isHide.value,
          });
          break;
        default:
          break;
      }
    };

    // Нажата клавиша мыши
    onMouseDown = (event) => {
      if (!isPause.value && !isGameOver.value && event.button === 0)
        world.shot(self);

      if (
        !isPause.value &&
        !isGameOver.value &&
        event.button === 2 &&
        !isOptical.value
      )
        store.dispatch('layout/setLayoutState', {
          field: 'isOptical',
          value: true,
        });
    };

    // Отпущена клавиша мыши
    onMouseUp = (event) => {
      if (
        !isPause.value &&
        !isGameOver.value &&
        event.button === 2 &&
        isOptical.value
      )
        store.dispatch('layout/setLayoutState', {
          field: 'isOptical',
          value: false,
        });
    };

    animate = () => {
      events.animate();
      world.animate(self);

      render();

      stats.update();

      requestAnimationFrame(animate);
    };

    onWindowResize = () => {
      self.camera.aspect = window.innerWidth / window.innerHeight;
      self.camera.updateProjectionMatrix();

      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    render = () => {
      renderer.render(self.scene, self.camera);
      // console.log('Renderer info: ', renderer.info.memory.geometries, renderer.info.memory.textures, renderer.info.render);
    };

    // This is self )
    let self: ISelf = {
      // Utils
      helper,
      assets,
      events,
      audio,

      // state
      keys,

      // Core
      store,
      scene,
      camera,
      listener,
      render,
    };

    // Set camera start
    self.camera.position.x = hero.value.positionX;
    self.camera.position.y = hero.value.positionY;
    self.camera.position.z = hero.value.positionZ;
    self.camera.fov = DESIGN.CAMERA.fov;

    // Следим за паузой
    watch(
      () => store.getters['layout/isPause'],
      (value) => {
        if (value) {
          // events.pause();
          controls.unlock();
        } else {
          // events.start();
          controls.lock();
        }
        audio.toggle(value);

        // Если c паузы - выключаем оптику
        if (!value && isOptical.value) {
          store.dispatch('layout/setLayoutState', {
            field: 'isOptical',
            value: false,
          });
        }
      },
    );

    // Следим за оптикой
    watch(
      () => store.getters['layout/isOptical'],
      (value) => {
        // this.hero.checkWeapon(this);
        // this.hero.toggleFire(value);
        if (value) self.camera.fov = DESIGN.CAMERA.fov / 4;
        else self.camera.fov = DESIGN.CAMERA.fov;
        self.camera.updateProjectionMatrix();
      },
    );

    // Следим за скрытным режимом
    watch(
      () => store.getters['layout/isHide'],
      (value) => {
        if (value) {
          self.events.messagesByIdDispatchHelper(self, 'hiddenMoveEnabled');
        } else
          self.events.messagesByIdDispatchHelper(self, 'hiddenMoveDisabled');
      },
    );

    // Следим за усталостью
    watch(
      () => store.getters['layout/isTired'],
      (value) => {
        if (value && isRun.value)
          store.dispatch('layout/setLayoutState', {
            field: 'isRun',
            value: false,
          });
        if (value) self.events.messagesByIdDispatchHelper(self, 'tired');
        else self.events.messagesByIdDispatchHelper(self, 'recovered');
      },
    );

    // Один первый рендер - когда все загрузилось и построилось
    watch(
      () => store.getters['preloader/isGameLoaded'],
      (value) => {
        if (value) render();
      },
    );

    onMounted(() => {
      init();
      animate();
    });
  },
});
</script>

<style lang="stylus">
.scene
  position absolute
  top 0
  left 0
  right 0
  bottom 0
  width 100vw
  height: 100vh
</style>
