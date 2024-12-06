<template>
    <el-form :model="formData" label-width="auto" label-position="right">
      <el-form-item>
        <template #label>
          <span style="font-size:16px">{{'中心频点:'}}</span>
        </template>
        <el-input type="number" v-model="formData.scanFreq" style="width:100%" :step="0.1" :precision="3" @blur="handleBlurSaveLocal('scanFreq')">
          <template #suffix>
            <span>MHz</span>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item>
        <template #label>
          <span style="font-size:16px">{{'带宽:'}}</span>
        </template>
        <el-input type="number" v-model="formData.bandWidth" style="width:100%" :step="0.1" :precision="3" @blur="handleBlurSaveLocal('bandWidth')">
          <template #suffix>
            <span>MHz</span>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item>
        <template #label>
          <span style="font-size:16px">{{'起始频点:'}}</span>
        </template>
        <span>{{ startFreq }} MHz</span>
      </el-form-item>
      <el-form-item>
        <template #label>
          <span style="font-size:16px">{{'刷新频率:'}}</span>
        </template>
        <el-input type="number" v-model="formData.intervalTime" style="width:100%" :step="0.1" :precision="3" @blur="handleBlurSaveLocal('intervalTime')">
          <template #suffix>
            <span>秒(s)</span>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item>
        <template #label>
          <span style="font-size:16px">{{'开关:'}}</span>
        </template>
        <el-switch v-model="formData.scanEnable" active-value="on" inactive-value="off" @change="handleBlurSaveLocal('scanEnable')" />
      </el-form-item>
      <el-form-item>
        <template #label>
          <span style="font-size:16px">{{'IP地址:'}}</span>
        </template>
        <el-input v-model="formData.apiServer" style="width:100%" @blur="handleBlurSaveLocal('apiServer')" />
      </el-form-item>
    <div style="position: absolute; right: 30px">
      <el-button
        type="primary"
        :loading="saveBtnLoading"
        @click="handleSubmitClick"
        >保存</el-button
      >
      <el-button @click="handleCancelClick">取消</el-button>
    </div>
    </el-form>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';

export default defineComponent({
  name: 'ScanForm',
  setup(props, { emit }) {
    const saveBtnLoading = ref(false);
    const formData = ref({
      apiServer: localStorage.getItem('apiServer') || 'http://192.168.1.104',
      scanFreq: localStorage.getItem('scanFreq') || 1697,
      bandWidth: localStorage.getItem('bandWidth') || 16,
      intervalTime: localStorage.getItem('intervalTime') || 5,
      scanEnable: localStorage.getItem('scanEnable') || 'on',
    })
    const startFreq = computed(() => {
      return formData.value.scanFreq - formData.value.bandWidth / 2
    })
    function handleSubmitClick() {
      const { apiServer, scanFreq, bandWidth, intervalTime, scanEnable } = formData.value
      // 调用接口
      saveBtnLoading.value = true;
      axios
        .post(
          `${apiServer}/action/shelltool`,
          {
            set: `rxcfg -s s,id=0,enable=on,freq=${NP.times(scanFreq, 1000)},band=${NP.divide(NP.times(bandWidth, 1000), 2)}`
          },
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        )
        .then((res) => {
          ElMessage.success("rxcfg设置成功");
          saveBtnLoading.value = false;
          emit('ok');
          handleCancelClick();
        })
        .catch((err) => {
          ElMessage.error("rxcfg设置失败");
          saveBtnLoading.value = false;
        });
      axios
        .post(
          `${apiServer}/action/shelltool`,
          {
            set: `spectrumcfg -s s,enable=${scanEnable},cycle=${NP.times(intervalTime, 1000)}`
          },
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        )
        .then((res) => {
          ElMessage.success("spectrumcfg设置成功");
          saveBtnLoading.value = false;
          emit('ok');
          handleCancelClick();
        })
        .catch((err) => {
          ElMessage.error("spectrumcfg设置失败");
          saveBtnLoading.value = false;
        });
    }
    function handleCancelClick() {
      emit("close");
    }
    function handleBlurSaveLocal(key) {
      if (!isEmpty(formData.value[key])) {
        localStorage.setItem(key, formData.value[key])
      }
    }
    return {
      saveBtnLoading,
      formData,
      startFreq,
      handleSubmitClick,
      handleCancelClick,
      handleBlurSaveLocal,
    }
  },
});
</script>
