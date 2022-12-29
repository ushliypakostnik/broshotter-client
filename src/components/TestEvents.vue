<template>
  <button @click="click">Тест шины событий!!!</button>
</template>

<script>
export default {
  name: 'TestEvents',

  methods: {
    click() {
      this.emitter.emit('testUIEvent', { event: 'AAAAAAAAAAAAAAAAAAa' });
    },
  },
};
</script>
