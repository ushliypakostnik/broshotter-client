<template>
  <div class="map">
    <div class="map__wrapper">
      <Loader v-if="!map" />
      <div
        v-else
        class="map__body"
        :style="`width: calc(${Math.sqrt(
          map.locations.length,
        )} * 10vh); height: calc(${Math.sqrt(map.locations.length)} * 10vh);`"
      >
        <div
          v-for="item in map.locations"
          :key="`item--${item.id}`"
          class="map__location"
          :style="`width: 10vh; height: 10vh; left: calc(${
            item.x + Math.floor(Math.sqrt(map.locations.length) / 2)
          } * 10vh); top: calc(${
            item.y + Math.floor(Math.sqrt(map.locations.length) / 2)
          } * 10vh);`"
        >
          <div
            v-for="id in item.users"
            :key="`player--${id}`"
            class="map__user point"
            :class="{ 'map__user--hero': id === hero }"
            :style="`left: calc(${
              getPlayerPositionById(id, map.users).x
            } * 10vh + 5vh); top: calc(${
              getPlayerPositionById(id, map.users).y
            } * 10vh + 5vh);`"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onBeforeMount, onBeforeUnmount } from 'vue';
import { useStore } from 'vuex';
import { key } from '@/store';

// Types
import type { IUser } from '@/models/api';

// Constants
import { DESIGN } from '@/utils/constants';

// Components
import Loader from '@/components/Layout/Loader.vue';

export default defineComponent({
  name: 'Map',

  components: {
    Loader,
  },

  setup() {
    const store = useStore(key);

    let timeout: ReturnType<typeof setInterval>;

    const map = computed(() => store.getters['api/map']);
    const hero = computed(() => store.getters['persist/id']);

    const getPlayerPositionById = (id: string, users: IUser[]) => {
      const user = users.find((player) => player.id === id);
      let x;
      let y;
      if (user) {
        x = (user.positionX / DESIGN.SIZE) * 0.7;
        y = (user.positionZ / DESIGN.SIZE) * 0.7;
      }
      return { x, y };
    };

    onBeforeMount(() => {
      timeout = setInterval(() => {
        store.dispatch('api/getMap');
      }, 1000);
    });

    onBeforeUnmount(() => {
      clearInterval(timeout);
    });

    return {
      map,
      hero,
      getPlayerPositionById,
    };
  },
});
</script>

<style lang="stylus" scoped>
$name = '.map'

{$name}
  background rgba(0, 0, 0, 0.5)

  &__wrapper
    width 100%
    height 100%
    @extend $flexCenter

  &__body
    border 2px solid $colors.stone
    position relative

  &__location
    position absolute
    border 2px solid $colors.stone

  &__user
    position absolute
    width 1vh
    height 1vh
    transform translateX(-0.5vh) translateY(-0.5vh)
    border-radius 50%
    background $colors.bird

{$name}__user--hero
  background $colors.dog
</style>
