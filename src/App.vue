<template>
  <Spectrum />
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, getCurrentInstance } from 'vue';
import Spectrum from './views/spectrum/index.vue';
import OduForm from './views/odu/OduForm.vue';
import TelnetForm from './views/telnet/TelnetForm.vue';
import ScanForm from './views/scan/ScanForm.vue';
import CheckForm from './views/check/CheckForm.vue';

export default defineComponent({
  name: 'App',
  components: {
    Spectrum
  },
  setup() {
    const currentInstance = getCurrentInstance();
    onMounted(() => {
      window.electronAPI.onSettingOdu(() => {
        currentInstance?.appContext.config.globalProperties.$createEleModal({
          modalProps: {
            width: '40%',
            closeOnClickModal: false,
            title: 'ODU配置',
          },
          content: {
            template: OduForm,
          },
          onOk: () => {}
        })
      });
      window.electronAPI.onSettingTelnet(() => {
        currentInstance?.appContext.config.globalProperties.$createEleModal({
          modalProps: {
            width: '40%',
            closeOnClickModal: false,
            title: 'Telnet配置',
          },
          content: {
            template: TelnetForm,
          },
          onOk: () => {}
        })
      });
      window.electronAPI.onSettingScan(() => {
        currentInstance?.appContext.config.globalProperties.$createEleModal({
          modalProps: {
            width: '40%',
            closeOnClickModal: false,
            title: '频谱扫描参数',
          },
          content: {
            template: ScanForm,
          },
          onOk: () => {}
        })
      });
      window.electronAPI.onSettingCheck(() => {
        currentInstance?.appContext.config.globalProperties.$createEleModal({
          modalProps: {
            width: '40%',
            closeOnClickModal: false,
            title: '检测参数',
          },
          content: {
            template: CheckForm,
          },
          onOk: () => {}
        })
      });
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
