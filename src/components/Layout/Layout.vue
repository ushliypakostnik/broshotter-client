<template>
  <div v-if="isDesktop && isBro" class="layout">
    <Preloader>
      <Connect />

      <Scene />

      <div class="layout__overlay" />

      <div class="layout__background" />

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

      <template v-if="!isGame">
        <div class="layout__blocker">
          <div class="layout__name">{{ $t('name') }}</div>

          <LangSwitch />

          <div class="layout__nick">{{ $t('nick') }}</div>
          <input class="layout__input" v-model="nickname" />

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

            <div class="layout__buttons layout__buttons--game">
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

// Emmiter
// import emitter from '@/utils/emitter';

// Constants
import { ScreenHelper } from '@/utils/constants';

// Types
// import { EmitterEvents } from '@/models/api';

// Components
import Connect from '@/components/Connect.vue';
import Preloader from '@/components/Layout/Preloader.vue';
import Gate from '@/components/Layout/Gate.vue';
import Scene from '@/components/Scene/Scene.vue';
import LangSwitch from '@/components/Layout/LangSwitch.vue';
import Scale from '@/components/Layout/Scale.vue';

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
    const isGameLoaded = computed(
      () => store.getters['preloader/isGameLoaded'],
    );
    const isGame = computed(() => store.getters['layout/isGame']);
    const isGameOver = computed(() => store.getters['layout/isGameOver']);
    const isPause = computed(() => store.getters['layout/isPause']);
    const health = computed(() => store.getters['api/health']);
    const endurance = computed(() => store.getters['layout/endurance']);
    const isOptical = computed(() => store.getters['layout/isOptical']);
    const isTired = computed(() => store.getters['layout/isTired']);
    const messages = computed(() => store.getters['layout/messages']);

    onMounted(() => {
      onWindowResize();
      window.addEventListener('resize', onWindowResize, false);
    });

    onWindowResize = () => {
      isDesktop.value = ScreenHelper.isDesktop();
    };

    play = () => {
      store.dispatch('layout/setLayoutState', {
        field: 'isPause',
        value: !isPause.value,
      });
    };

    enter = () => {
      // emitter.emit(EmitterEvents.updateToServer, { name: nickname.value });
      store.dispatch('api/setApiState', {
        field: 'updates',
        value: { name: nickname.value },
      });
    };

    return {
      t,
      isDesktop,
      isBro,
      isGameLoaded,
      isGame,
      isGameOver,
      isPause,
      isOptical,
      isTired,
      health,
      endurance,
      messages,
      play,
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

  &__background
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

  &__buttons
    display flex
    align-items center
    flex-direction column
    justify-content center

    &--game
      margin-top 4vh
      margin-bottom 9vh

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

  &__scales
    position absolute
    bottom 10px
    left 10px
    width 15vw
</style>
