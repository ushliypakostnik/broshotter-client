<template>
  <div class="preloader">
    <slot />
    <div v-if="isReload" class="preloader__gate" />
    <div v-if="!isGameLoaded" class="preloader__gate">
      <Loader />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, watch } from 'vue';
import { useStore } from 'vuex';
import { key } from '@/store';

// Components
import Loader from '@/components/Layout/Loader.vue';

export default defineComponent({
  name: 'Preloader',

  components: {
    Loader,
  },

  setup() {
    const store = useStore(key);

    const isGameLoaded = computed(
      () => store.getters['preloader/isGameLoaded'],
    );

    const isReload = computed(() => store.getters['persist/isReload']);

    // Следим загрузилась ли игра
    watch(
      () => store.getters['preloader/isGameLoaded'],
      (value) => {
        if (value) {
          store.dispatch('persist/setPersistState', {
            field: 'isReload',
            value: false,
          });
        }
      },
    );

    return {
      isGameLoaded,
      isReload,
    };
  },
});
</script>

<style lang="stylus" scoped>
.preloader
  &__gate
    @extend $viewport
    @extend $flexCenter
    color $colors.white
    background $colors.black
    z-index 2000
    $text('olga')
</style>
