<template>
  <!-- <SForm ref="sform" ok :form-items="formItems" :form-data="formData" @submit="handleSubmitClick" @cancel="handleCancelClick" /> -->
  <el-form :model="formData" label-width="auto">
    <el-form-item label="LNB馈电电压">
      <el-radio-group v-model="formData.lnb_pwr">
        <el-radio value="on_18" size="large">18V</el-radio>
        <el-radio value="on_13" size="large">13V</el-radio>
        <el-radio value="off" size="large">关</el-radio>
      </el-radio-group>
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
import { defineComponent, onMounted, ref } from "vue";
import axios from "axios";
axios.defaults.timeout = 3000;

export default defineComponent({
  name: "OduForm",
  props: {
    apiServer: {
      type: String,
      required: true,
    },
  },
  setup(props, { emit }) {
    // const formItems = [
    //   [
    //     {
    //       type: 'radio',
    //       label: 'LNB馈电电压',
    //       options: [
    //         {
    //           dictLabel: '18V', dictValue: 'on_18',
    //           dictLabel: '13V', dictValue: 'on_13',
    //           dictLabel: '关', dictValue: 'off',
    //         }
    //       ]
    //     }
    //   ]
    // ]
    const saveBtnLoading = ref(false);
    const formData = ref({});
    onMounted(() => {
      queryOduCfg();
    });

    function handleSubmitClick() {
      axios
        .post(
          `${props.apiServer}/action/shelltool`,
          {
            set: `oducfg -s s,lnb_pwr=${formData.value.lnb_pwr}`,
          },
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        )
        .then((res) => {
          console.log("oducfg axios then res", res);
          ElMessage.success("设置成功");
          saveBtnLoading.value = false;
          handleCancelClick();
        })
        .catch((err) => {
          console.log("oducfg axios catch err", err);
          ElMessage.error("设置失败");
          saveBtnLoading.value = false;
        });
    }
    function handleCancelClick() {
      emit("close");
    }

    function queryOduCfg() {
      axios
        .get(`${props.apiServer}/action/shelltool?get=oducfg;`)
        .then((resAxios) => {
          const res = resAxios.data;
          if (!isEmpty(res.oducfg)) {
            const { lnb_pwr } = res.oducfg;
            formData.value.lnb_pwr = lnb_pwr;
          }
        })
        .catch((err) => {
          ElMessage.error("请求数据异常，请检查IP地址及网络");
        });
    }
    return {
      // formItems,
      formData,
      saveBtnLoading,
      handleSubmitClick,
      handleCancelClick,
    };
  },
});
</script>
