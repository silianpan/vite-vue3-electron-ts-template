<template>
  <Spectrum />
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, getCurrentInstance } from 'vue';
import Spectrum from './views/spectrum/index.vue';

export default defineComponent({
  name: 'App',
  components: {
    Spectrum
  },
  setup() {
    const currentInstance = getCurrentInstance();
    onMounted(() => {
    })
  }
});
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
img {
  margin: 5px;
}
.plugins {
  font-size: 20px;
  font-weight: bold;
  margin-top: 20px;
}
</style>
