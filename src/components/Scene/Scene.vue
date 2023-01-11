<template>
  <div id="scene" class="scene" />
</template>

<script lang="ts">
import {
  defineComponent,
  onMounted,
  computed,
  watch,
  reactive,
  ref,
} from 'vue';
import { useStore } from 'vuex';
import { key } from '@/store';

import * as THREE from 'three';

// Constants
import { Audios, Colors, DESIGN } from '@/utils/constants';

// Emmiter
import emitter from '@/utils/emitter';

// Types
import { EmitterEvents } from '@/models/api';
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
import Octree from '@/components/Scene/World/Math/Octree';

// Stats
import Stats from 'three/examples/jsm/libs/stats.module';
import { IUser } from '@/models/api';

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
    const isEnter = computed(() => store.getters['api/isEnter']);
    const id = computed(() => store.getters['layout/id']);
    const game = computed(() => store.getters['api/game']);
    const isGameOver = computed(() => store.getters['layout/isGameOver']);
    const isGameLoaded = computed(
      () => store.getters['preloader/isGameLoaded'],
    );
    const isPause = computed(() => store.getters['layout/isPause']);
    const isOptical = computed(() => store.getters['layout/isOptical']);
    const isHide = computed(() => store.getters['layout/isHide']);
    const isRun = computed(() => store.getters['layout/isRun']);

    const isSet = ref(false);

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
        DESIGN.SIZE / 10,
        DESIGN.SIZE * 3,
      );
      self.scene = scene;
      self.render = render;

      // Renderer
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      container.appendChild(renderer.domElement);

      // Controls
      controls = new PointerLockControls(camera, renderer.domElement);
      controls.addEventListener('unlock', () => {
        store.dispatch('layout/setLayoutState', {
          field: 'isPause',
          value: true,
        });
      });
      if (isPause.value || isGameOver.value) controls.unlock();
      else controls.lock();

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

      // Реагировать на ответ на выстрел
      emitter.on(EmitterEvents.onShot, (shot) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        world.onShot(self, shot);
      });

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
          if (
            isEnter.value &&
            !isGameOver.value &&
            !isPause.value &&
            isRun.value
          )
            store.dispatch('layout/setLayoutState', {
              field: 'isRun',
              value: false,
            });
          break;

        case 80: // P
          if (isEnter.value && !isGameOver.value)
            store.dispatch('layout/setLayoutState', {
              field: 'isPause',
              value: !isPause.value,
            });
          break;

        case 67: // C
        case 18: // Alt
          if (isEnter.value && !isGameOver.value && !isPause.value)
            self.audio.replayHeroSound(Audios.jumpstart);
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
      if (
        isEnter.value &&
        !isPause.value &&
        !isGameOver.value &&
        event.button === 0
      )
        emitter.emit(EmitterEvents.shot, world.shot(self));

      if (
        isEnter.value &&
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
        isEnter.value &&
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
      if (isGameLoaded.value && isEnter.value) {
        events.animate();
        world.animate(self);
      }

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

      // math
      octree: new Octree(),
      octree2: new Octree(),

      // state
      keys,

      // emits
      emitter,

      // Core
      store,
      scene,
      camera,
      listener,
      render,
    };

    self.camera.fov = DESIGN.CAMERA.fov;

    // Следим за данными мира чтобы установить правильную позицию игроку
    watch(
      () => store.getters['api/game'],
      (value) => {
        if (value && !isSet.value) {
          // Set camera start
          if (id.value && game.value) {
            const user = game.value.users.find(
              (player: IUser) => player.id === id.value,
            );
            if (user && user.name && user.name.length) {
              self.camera.position.x = user.positionX;
              self.camera.position.y = user.positionY;
              self.camera.position.z = user.positionZ;
            } else {
              self.camera.position.x = DESIGN.GAMEPLAY.START.positionX;
              self.camera.position.y = DESIGN.GAMEPLAY.START.positionY;
              self.camera.position.z = DESIGN.GAMEPLAY.START.positionZ;
            }
          } else {
            self.camera.position.x = DESIGN.GAMEPLAY.START.positionX;
            self.camera.position.y = DESIGN.GAMEPLAY.START.positionY;
            self.camera.position.z = DESIGN.GAMEPLAY.START.positionZ;
          }

          isSet.value = true;
        }
      },
    );

    // Следим за паузой
    watch(
      () => store.getters['layout/isPause'],
      (value) => {
        if (value) controls.unlock();
        else controls.lock();

        // Если c паузы - выключаем оптику
        if (!value && isOptical.value) {
          store.dispatch('layout/setLayoutState', {
            field: 'isOptical',
            value: false,
          });
        }
      },
    );

    // Следим за концом игры
    watch(
      () => store.getters['layout/isGameOver'],
      (value) => {
        setTimeout(() => {
          controls.unlock();
        }, process.env.VUE_APP_TIMEOUT || 75);

        // Если c оптики - выключаем оптику
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
        if (value) animate();
      },
    );

    onMounted(() => {
      init();
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
