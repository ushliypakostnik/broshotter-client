<template>
  <div v-if="isDesktop && isBro" class="layout">
    <Preloader>
      <Connect />

      <Scene />

      <div class="layout__overlay" />

      <template v-if="!isGame">
        <div class="layout__blocker layout__blocker--enter">
          <div class="layout__name">{{ $t('name') }}</div>

          <TestEvents />

          <LangSwitch />

          <div class="layout__nick">{{ $t('nick') }}</div>
          <input class="layout__input" v-model="nickname" />

          <div>
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
      </template>

      <template v-else>
        <transition-group name="fade2" tag="ul" class="layout__messages">
          <li
            class="layout__message"
            v-for="(message, index) in messages"
            :key="`message${index}`"
          >
            {{ $t(`${message.text}`) }}
          </li>
        </transition-group>

        <transition name="fade">
          <div v-if="isPause && isGameLoaded" class="layout__blocker">
            <div class="layout__name">{{ $t('name') }}</div>

            <LangSwitch />

            <div class="layout__buttons">
              <button
                class="layout__button"
                type="button"
                @click.prevent.stop="play"
              >
                {{ $t('startbutton') }}
              </button>
            </div>

            <div class="layout__help">
              <div class="layout__keys">
                <p>{{ $t('key1') }}</p>
              </div>

              <div class="layout__copy">
                <p>{{ $t('copyright') }}</p>
              </div>
            </div>
          </div>
        </transition>
      </template>
    </Preloader>
  </div>

  <Gate v-else-if="!isDesktop" face="gadgets" />
  <Gate v-else face="chrome" />
</template>

<script lang="ts">
import { defineComponent, computed, onMounted, ref, Ref } from 'vue';
import { useStore } from 'vuex';
import { key } from '@/store';
import { useI18n } from 'vue-i18n';

import Connect from '@/components/Connect.vue';
import TestEvents from '@/components/TestEvents.vue';
import Preloader from '@/components/Layout/Preloader.vue';
import Gate from '@/components/Layout/Gate.vue';
import Scene from '@/components/Scene/Scene.vue';
import LangSwitch from '@/components/Layout/LangSwitch.vue';

// Utils
import { ScreenHelper, restartDispatchHelper } from '@/utils/utilities';

export default defineComponent({
  name: 'Layout',

  components: {
    Connect,
    TestEvents,
    Preloader,
    Scene,
    LangSwitch,
    Gate,
  },

  setup() {
    const { t } = useI18n();

    const store = useStore(key);

    let isDesktop: Ref<boolean> = ref(false);
    let nickname: Ref<string> = ref('');
    const isBro = ScreenHelper.isBro();
    let onWindowResize: () => void;
    let play: () => void;
    let restart: () => void;
    let enter: () => void;

    const isGameLoaded = computed(
      () => store.getters['preloader/isGameLoaded'],
    );
    const isGame = computed(() => store.getters['layout/isGame']);
    const isPause = computed(() => store.getters['layout/isPause']);
    const messages = computed(() => store.getters['layout/messages']);

    onMounted(() => {
      onWindowResize();
      window.addEventListener('resize', onWindowResize, false);
    });

    onWindowResize = () => {
      isDesktop.value = ScreenHelper.isDesktop();
    };

    play = () => {
      store.dispatch('layout/setField', {
        field: 'isPause',
        value: !isPause.value,
      });
    };

    restart = () => {
      restartDispatchHelper(store);
    };

    enter = () => {
      store.dispatch('api/enter', {
        name: nickname.value,
      });
    };

    return {
      t,
      isDesktop,
      isBro,
      isGameLoaded,
      isGame,
      isPause,
      messages,
      play,
      restart,
      enter,
      nickname,
    };
  },
});
</script>

<style lang="stylus" scoped>
.layout
  @extend $viewport
  text-align center

  &__name
    color $colors.sea
    margin-top 15vh
    margin-bottom 7vh
    $text("olga")

  &__enter
    color $colors.sea
    margin-bottom 9vh
    $text("katya")

  &__nick
    color $colors.sea
    margin-top 7vh
    margin-bottom 2vh
    $text("elena")

  &__input
    width 25vw
    padding-left 10px
    padding-right 10px
    margin-bottom 5vh
    color $colors.sea
    border 4px solid $colors.sea
    background transparent
    $text("elena")

  &__overlay
    @extend $viewport
    display flex
    justify-content flex-end
    pointer-events none
    background linear-gradient(0deg, rgba($colors.primary, $opacites.jazz) 0%, rgba($colors.ghost, $opacites.rock) 100%)
    z-index 500

  &__messages
    @extend $viewport
    list-style none
    padding 0.5vw 1vw
    pointer-events none
    z-index 1000
    color $colors.sea

  &__message
    margin-bottom 0.5vw
    $text("maria")

  &__blocker
    @extend $viewport
    text-align center
    background linear-gradient(0deg, rgba($colors.primary, $opacites.funky) 0%, rgba($colors.ghost, $opacites.psy) 100%)
    z-index 2000

    &--enter
      background linear-gradient(0deg, $colors.primary 0%, $colors.ghost 100%)

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
      margin-bottom 9vh

  p
    margin-bottom $gutter
    color $colors.sea
    $text("nina")

  &__help
    margin-top $gutter * 2

  &__keys
    margin-bottom $gutter / 2

  &__copy
    margin-top $gutter * 2
</style>
