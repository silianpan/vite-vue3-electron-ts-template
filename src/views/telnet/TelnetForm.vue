<template>
  <el-form :model="formData" label-width="auto" label-position="right">
    <el-form-item label="开关" style="align-items: center;">
      <el-radio-group v-model="formData.telnetd_enable">
        <el-radio value="on" size="large">开</el-radio>
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
// import { isEmpty } from '@/utils/common';
import axios from "axios";
axios.defaults.timeout = 3000;

export default defineComponent({
  name: "TelnetForm",
  props: {
    apiServer: {
      type: String,
      required: true,
    },
  },
  setup(props, { emit }) {
    const saveBtnLoading = ref(false);
    const formData = ref({});
    onMounted(() => {
      queryTelnetCfg();
    });

    function handleSubmitClick() {
      // 存储本地
      localStorage.setItem('setting-telnet-telnetd_enable', formData.value.telnetd_enable)

      // 调用接口
      saveBtnLoading.value = true;
      axios
        .post(
          `${props.apiServer}/action/shelltool`,
          {
            set: `telnetdcfg -s s,telnetd_enable=${formData.value.telnetd_enable}`,
          },
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        )
        .then((res) => {
          console.log("telnetdcfg axios then res", res);
          ElMessage.success("设置成功");
          saveBtnLoading.value = false;
          emit('ok');
          handleCancelClick();
        })
        .catch((err) => {
          console.log("telnetdcfg axios catch err", err);
          ElMessage.error("设置失败");
          saveBtnLoading.value = false;
        });
    }
    function handleCancelClick() {
      emit("close");
    }

    function queryTelnetCfg() {
       formData.value.telnetd_enable = localStorage.getItem('setting-telnet-telnetd_enable') || 'on'
      // axios
      //   .get(`${props.apiServer}/action/shelltool?get=telnetdcfg;`)
      //   .then((resAxios) => {
      //     const res = resAxios.data;
      //     if (!isEmpty(res.telnetdcfg)) {
      //       const { telnetd_enable } = res.telnetdcfg;
      //       console.log('res.telnetdcfg', res.telnetdcfg)
      //       formData.value.telnetd_enable = telnetd_enable;
      //     }
      //   })
      //   .catch((err) => {
      //     ElMessage.error("请求数据异常，请检查IP地址及网络");
      //   });
    }
    return {
      formData,
      saveBtnLoading,
      handleSubmitClick,
      handleCancelClick,
    };
  },
});
</script>
