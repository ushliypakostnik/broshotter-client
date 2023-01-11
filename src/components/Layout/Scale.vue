<template>
  <div class="scale" :class="[lock && 'scale--lock', not && 'effect']">
    <div
      v-if="progress > 0"
      class="scale__progress"
      :class="`scale__progress--${face}`"
      :style="{ width: progress + '%' }"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'Scale',

  props: {
    face: {
      type: String,
      default: null,
      required: true,
    },
    progress: {
      type: Number,
      default: null,
      required: true,
    },
    lock: {
      type: Boolean,
      default: false,
      required: false,
    },
    not: {
      type: Boolean,
      default: false,
      required: false,
    },
  },
});
</script>

<style lang="stylus" scoped>

.scale
  width 100%
  background transparent
  padding 5px

  &--lock
    opacity 0.5

  &__progress
    height 10px

    &--health
      background $colors.bird

    &--endurance
      background $colors.ghost
</style>
