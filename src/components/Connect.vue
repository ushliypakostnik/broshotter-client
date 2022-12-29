<template>
  <div />
</template>

<script>
/* eslint-disable */
export default {
  name: 'Connect',

  sockets: {
    connect: () => {
      console.log('socket connected');
    },

    onEnter: (data) => {
      console.log(
        'this method was fired by the socket server. eg: io.emit("onEnter", data) ',
        data,
      );
    },
  },

  created() {
    this.emitter.on('testUIEvent', (data) => {
      console.log('Connect onTestUIEvent', data);
      this.$socket.emit('test', data);
    })
  },
};
</script>
