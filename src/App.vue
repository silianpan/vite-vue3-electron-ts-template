<template>
  <Spectrum />
</template>

<script lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
import Spectrum from "./views/spectrum/index.vue";
import { defineComponent, ref, onMounted, getCurrentInstance } from 'vue';
export default defineComponent({
  name: 'App',
  components: {
    Spectrum
  },
  setup() {
    const currentInstance = getCurrentInstance();
    onMounted(() => {
      // window.electronAPI.onSettingScan(() => {
      //   console.log('setting-scan');
      // });
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
