<template>
  <div id="scene" class="scene" />
</template>

<script lang="ts">
import { defineComponent, onMounted, computed, watch } from 'vue';
import { useStore } from 'vuex';
import { key } from '@/store';

import * as THREE from 'three';

// Constants
import { Colors, DESIGN } from '@/utils/constants';

// Types
import type { ISelf } from '@/models/modules';
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

    // Store getters
    const isGame = computed(() => store.getters['layout/isGame']);
    const isPause = computed(() => store.getters['layout/isPause']);

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
      scene.background = new THREE.Color(Colors.blue);
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

      camera.position.y = 1.8; // Убрать!!!
      scene.add(camera);

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

      // Modules
      assets.init(self);
      audio.init(self);
      world.init(self);

      container.appendChild(stats.dom);

      // First render
      onWindowResize();
      render();
    };

    // Клавиша клавиатуры нажата
    onKeyDown = (event) => {
      switch (event.keyCode) {
        default:
          break;
      }
    };

    // Клавиша клавиатуры отпущена
    onKeyUp = (event) => {
      switch (event.keyCode) {
        case 80: // P
          if (isGame.value)
            store.dispatch('layout/setLayoutState', {
              field: 'isPause',
              value: !isPause.value,
            });
          break;
        default:
          break;
      }
    };

    animate = () => {
      if (isGame.value && !isPause.value) {
        events.animate();
        world.animate(self);

        render();
      }

      stats.update();

      requestAnimationFrame(animate);
    };

    onWindowResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();

      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    render = () => {
      renderer.render(scene, camera);
      // console.log('Renderer info: ', renderer.info.memory.geometries, renderer.info.memory.textures, renderer.info.render);
    };

    // This is self )
    let self: ISelf = {
      // Utils
      helper,
      assets,
      events,
      audio,

      // Core
      store,
      scene,
      listener,
      render,
    };

    // Следим за паузой
    watch(
      () => store.getters['layout/isPause'],
      (value) => {
        if (value) {
          events.pause();
          controls.unlock();
        } else {
          events.start();
          controls.lock();
        }
        audio.toggle(value);
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
