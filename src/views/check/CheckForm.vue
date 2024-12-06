<template>
    <el-form :model="formData" label-width="auto" label-position="right">
      <el-form-item>
        <template #label>
          <span style="font-size:16px">{{'频点:'}}</span>
        </template>
        <el-input type="number" v-model="formData.singleFreq" style="width:100%" :step="0.1" :precision="3" @blur="handleBlurSaveLocal('singleFreq')">
          <template #suffix>
            <span>MHz</span>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item>
        <template #label>
          <span style="font-size:16px">{{'区间:'}}</span>
        </template>
        <el-input type="number" v-model="formData.blasFreq" style="width:100%" :step="0.1" :precision="3" @blur="handleBlurSaveLocal('blasFreq')">
          <template #suffix>
            <span>KHz</span>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item>
        <template #label>
          <span style="font-size:16px">{{'下门限:'}}</span>
        </template>
        <el-input type="number" v-model="formData.thresholdMin" style="width:100%" :step="0.1" :precision="3" @blur="handleBlurSaveLocal('thresholdMin')">
          <template #suffix>
            <span>dB</span>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item>
        <template #label>
          <span style="font-size:16px">{{'上门限:'}}</span>
        </template>
        <el-input type="number" v-model="formData.thresholdMax" style="width:100%" :step="0.1" :precision="3" @blur="handleBlurSaveLocal('thresholdMax')">
          <template #suffix>
            <span>dB</span>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item>
        <template #label>
          <span style="font-size:16px">{{'记录路径：'}}</span>
        </template>
        <el-input v-model="formData.recordFilePath" style="width:100%" @blur="handleBlurSaveLocal('recordFilePath')" />
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
import { defineComponent, ref, onMounted } from 'vue';

export default defineComponent({
  name: 'CheckForm',
  setup(props, { emit }) {
    const saveBtnLoading = ref(false);
    const formData = ref({
      singleFreq: localStorage.getItem('singleFreq') || 1697,
      blasFreq: localStorage.getItem('blasFreq') || 0,
      thresholdMin: localStorage.getItem('thresholdMin') || 0,
      thresholdMax: localStorage.getItem('thresholdMax') || 0,
      recordFilePath: '',
    })
    onMounted(() => {
      formData.value.recordFilePath = localStorage.getItem('recordFilePath') || window.fileAPI.getUserDir()
    });
    function handleSubmitClick() {
      ElMessage.success("设置成功");
      emit('ok');
      handleCancelClick();
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
      handleSubmitClick,
      handleCancelClick,
      handleBlurSaveLocal,
    }
  },
});
</script>
