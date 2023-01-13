<template>
  <div v-if="isDesktop && isBro" class="layout">
    <Preloader>
      <Connect />

      <Scene />

      <template v-if="!isEnter">
        <div class="layout__enter">
          <div class="layout__overlay layout__overlay--enter" />
          <div class="layout__effect" />

          <div class="layout__dialog">
            <div class="layout__header">{{ $t('name') }}</div>

            <LangSwitch />

            <div class="layout__nick">{{ $t('nick') }}</div>
            <div class="layout__nick2">{{ $t('nick2') }}</div>
            <input class="layout__input" v-model="nickname" maxlength="25" />

            <div class="layout__buttons">
              <button
                class="layout__button layout__button--enter"
                :class="{ 'layout__button--disabled': nickname.length === 0 }"
                type="button"
                @click.prevent.stop="enter"
              >
                {{ $t('enter') }}
              </button>
            </div>

            <div class="layout__copy">
              <p>{{ $t('copyright') }}</p>
            </div>
          </div>
        </div>
      </template>

      <template v-else>
        <div class="layout__scales">
          <Scale face="health" :progress="!isGameOver ? health : 0" />
          <Scale
            face="endurance"
            :progress="endurance"
            :lock="isTired && !isGameOver"
            :not="isTired && !isGameOver"
          />
        </div>

        <div class="layout__optical-preload" />
        <div class="layout__optical" v-if="isOptical">
          <div class="layout__optical--side" />
          <div class="layout__optical--center" />
          <div class="layout__optical--side" />
        </div>

        <div
          class="layout__overlay"
          :class="[
            isOnHit && !isGameOver && `layout__overlay--hit hit`,
            isGameOver && 'layout__overlay--hit',
          ]"
        />

        <transition-group name="fade2" tag="ul" class="layout__messages">
          <li
            class="layout__message"
            v-for="(message, index) in messages"
            :key="`message${index}`"
          >
            {{ $t(`${message.text}`) }}
          </li>
        </transition-group>

        <div class="layout__name">{{ name }}</div>

        <div class="layout__effect" />

        <transition name="fade">
          <div
            v-if="(isPause && isGameLoaded) || isGameOver"
            class="layout__blocker"
            :class="{ 'layout__blocker--pause': !isGameOver }"
          >
            <div class="layout__header">
              {{ !isGameOver ? $t('name') : $t('gameover') }}
            </div>

            <LangSwitch v-if="!isGameOver" />

            <div class="layout__buttons">
              <button
                v-if="!isGameOver"
                class="layout__button"
                type="button"
                @click.prevent.stop="play"
              >
                {{ $t('startbutton') }}
              </button>

              <button
                class="layout__button layout__button--enter"
                type="button"
                @click.prevent.stop="reenter"
              >
                {{ $t('restartbutton') }}
              </button>
            </div>

            <div v-if="!isGameOver" class="layout__help">
              <div class="layout__keys">{{ $t('control1') }}</div>
              <div class="layout__keys">{{ $t('control2') }}</div>
              <div class="layout__keys">{{ $t('control3') }}</div>
              <div class="layout__keys">{{ $t('control4') }}</div>
              <div class="layout__keys">{{ $t('control5') }}</div>
              <div class="layout__keys">{{ $t('control6') }}</div>
              <div class="layout__keys">{{ $t('control8') }}</div>
              <div class="layout__keys">{{ $t('control9') }}</div>
            </div>
            <div class="layout__copy">{{ $t('copyright') }}</div>
          </div>
        </transition>
      </template>
    </Preloader>
  </div>

  <Gate v-else-if="!isDesktop" face="gadgets" />
  <Gate v-else face="chrome" />
</template>

<script lang="ts">
import { defineComponent, computed, onMounted, ref, Ref, watch } from 'vue';
import { useStore } from 'vuex';
import { key } from '@/store';
import { useI18n } from 'vue-i18n';

// Emmiter
import emitter from '@/utils/emitter';

// Constants
import { DESIGN, ScreenHelper } from '@/utils/constants';

// Types
import { EmitterEvents, IUser } from '@/models/api';

// Components
import Connect from '@/components/Connect.vue';
import Preloader from '@/components/Layout/Preloader.vue';
import Gate from '@/components/Layout/Gate.vue';
import Scene from '@/components/Scene/Scene.vue';
import LangSwitch from '@/components/Layout/LangSwitch.vue';
import Scale from '@/components/Layout/Scale.vue';

// Utils
import { restartDispatchHelper } from '@/utils/utils';

export default defineComponent({
  name: 'Layout',

  components: {
    Connect,
    Preloader,
    Scene,
    LangSwitch,
    Gate,
    Scale,
  },

  setup() {
    const { t } = useI18n();
    const store = useStore(key);

    let isDesktop: Ref<boolean> = ref(false);
    let nickname: Ref<string> = ref('');
    const isBro = ScreenHelper.isBro();
    let onWindowResize: () => void;
    let play: () => void;
    let enter: () => void;
    let reenter: () => void;
    const isGameLoaded = computed(
      () => store.getters['preloader/isGameLoaded'],
    );
    const isEnter = computed(() => store.getters['api/isEnter']);
    const isOnHit = computed(() => store.getters['api/isOnHit']);
    const health = computed(() => store.getters['api/health']);
    const name = computed(() => store.getters['layout/name']);
    const isGameOver = computed(() => store.getters['layout/isGameOver']);
    const isPause = computed(() => store.getters['layout/isPause']);
    const endurance = computed(() => store.getters['layout/endurance']);
    const isTired = computed(() => store.getters['layout/isTired']);
    const isOptical = computed(() => store.getters['not/isOptical']);
    const messages = computed(() => store.getters['not/messages']);

    onMounted(() => {
      onWindowResize();
      window.addEventListener('resize', onWindowResize, false);
    });

    onWindowResize = () => {
      isDesktop.value = ScreenHelper.isDesktop();
    };

    reenter = () => {
      emitter.emit(EmitterEvents.reenter);
      restartDispatchHelper(store);
    };

    enter = () => {
      emitter.emit(EmitterEvents.enter, nickname.value);
      store.dispatch('layout/setLayoutState', {
        field: 'name',
        value: nickname.value,
      });
    };

    play = () => {
      store.dispatch('layout/setLayoutState', {
        field: 'isPause',
        value: !isPause.value,
      });
    };

    return {
      t,
      isDesktop,
      isBro,
      isGameLoaded,
      isEnter,
      isGameOver,
      isPause,
      isOptical,
      isTired,
      health,
      name,
      endurance,
      messages,
      play,
      enter,
      reenter,
      nickname,
      isOnHit,
    };
  },
});
</script>

<style lang="stylus" scoped>
$name = '.layout'

{$name}
  @extend $viewport
  text-align center

  &__header
    color $colors.sea
    margin-top 13vh
    margin-bottom 6vh
    $text("olga")

  &__enter
    @extend $viewport
    background url("../../assets/enter.jpg") no-repeat center top
    background-size cover

    {$name}__effect
      z-index 20
      box-shadow inset 0 0 $gutter * 20 $colors.sea

  &__dialog
    @extend $viewport
    z-index 100

  &__nick
    color $colors.sea
    margin-top 7vh
    margin-bottom 20px
    $text("elena")

  &__nick2
    color $colors.sea
    margin-bottom 2vh
    $text("nina")

  &__input
    width 25vw
    padding-left 10px
    padding-right 10px
    margin-bottom 3vh
    color $colors.sea
    border 4px solid $colors.sea
    background transparent
    $text("elena")

  &__overlay
    @extend $viewport
    z-index 10

    &--enter
      background linear-gradient(0deg, rgba($colors.primary, $opacites.rock) 0%, rgba($colors.ghost, $opacites.rock) 100%)

    &--hit
      background $colors.hit

  &__effect
    @extend $viewport
    background rgba(112, 66, 20, 0.1)
    box-shadow inset 0 0 $gutter * 6 $colors.sea

  &__optical
    @extend $viewport
    display flex
    background-color rgba(255, 255, 255, 0.15)
    transform scale(1.1, 1.1)

    &--side
      background $colors.cosmos
      flex-grow 1
      transform scale(1.1, 1.1)

    &--center
      flex-grow 0
      background url("../../assets/optical.png") no-repeat center top
      background-size cover
      width 100vh
      height 100vh

    &-preload
      position absolute
      left 99999px
      opacity 0
      background url("../../assets/optical.png") no-repeat center top

  &__messages
    @extend $viewport
    text-align left
    list-style none
    padding 0.5vw 1vw
    pointer-events none
    // color $colors.sea
    color $colors.stone

  &__message
    margin-bottom 0.5vw
    $text("maria")

  &__name
    position absolute
    top 0
    right 0
    color $colors.stone
    $text("maria")

  &__blocker
    @extend $viewport
    text-align center
    z-index 2000

    &--pause
      background linear-gradient(0deg, rgba($colors.primary, $opacites.funky) 0%, rgba($colors.ghost, $opacites.psy) 100%)

  &__buttons
    display flex
    align-items center
    flex-direction column
    justify-content center

  &__button
    margin-top $gutter * 2
    @extend $button

    &--disabled
      pointer-events none
      opacity 0.5

    &--enter
      margin-bottom 5vh

  &__keys,
  &__copy
    margin-bottom 10px
    color $colors.sea
    $text("nina")

  &__copy
    margin-top $gutter * 2

  &__scales
    position absolute
    bottom 10px
    left 10px
    width 15vw
</style>
