<template>
  <div style="position:absolute;top:20px;bottom:20px;left:0;right:0;">
    <el-form inline>
      <el-form-item>
        <template #label>
          <span style="font-size:16px">{{'频谱扫描参数：'}}</span>
        </template>
      </el-form-item>
      <el-form-item style="margin-right:10px">
        <template #label>
          <span style="font-size:16px">{{'中心频点:'}}</span>
        </template>
        <el-input type="number" v-model="scanFreq" style="width:130px" :step="0.1" :precision="3">
          <template #suffix>
            <span>MHz</span>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item style="margin-right:10px">
        <template #label>
          <span style="font-size:16px">{{'带宽:'}}</span>
        </template>
        <el-input type="number" v-model="bandWidth" style="width:130px" :step="0.1" :precision="3">
          <template #suffix>
            <span>MHz</span>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item style="margin-right:10px">
        <template #label>
          <span style="font-size:16px">{{'起始频点:'}}</span>
        </template>
        <span>{{ startFreq }} MHz</span>
      </el-form-item>
      <el-form-item style="margin-right:10px">
        <template #label>
          <span style="font-size:16px">{{'刷新频率:'}}</span>
        </template>
        <el-input type="number" v-model="intervalTime" style="width:130px" :step="0.1" :precision="3">
          <template #suffix>
            <span>秒(s)</span>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item style="margin-right:10px">
        <template #label>
          <span style="font-size:16px">{{'开关:'}}</span>
        </template>
        <el-switch v-model="scanEnable" active-value="on" inactive-value="off" />
      </el-form-item>
      <el-form-item style="margin-right:10px">
        <el-button type="primary" :loading="saveBtnLoading" @click="handleSaveClick">保存配置</el-button>
      </el-form-item>
    </el-form>
    <el-form inline>
      <el-form-item style="margin-right:10px">
        <template #label>
          <span style="font-size:16px">{{'单载波检测:'}}</span>
        </template>
        <el-switch v-model="isEnable" :active-value="true" :inactive-value="false" />
      </el-form-item>
      <el-form-item style="margin-right:10px">
        <template #label>
          <span style="font-size:16px">{{'中心频点:'}}</span>
        </template>
        <el-input type="number" v-model="singleFreq" style="width:130px" :disabled="!isEnable" :step="0.1" :precision="3">
          <template #suffix>
            <span>MHz</span>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item v-show="isEnable">
        <template #label>
          <!-- <span style="font-size:16px">{{'单载波判断阈值:'}}</span> -->
        </template>
        <div style="display:flex">
          <!-- <el-input type="number" v-model="threshold" style="width:130px" /> -->
          <div style="font-size:16px;width:200px;margin-left:10px">
            <span>是否为单载波：</span>
            <span :style="{color: isSingleVal ? 'green' : 'red'}">{{`${isSingleVal ? '是' : '否'}`}}</span>
          </div>
        </div>
      </el-form-item>
      <el-form-item style="margin-right:10px">
        <template #label>
          <span style="font-size:16px">{{'IP地址:'}}</span>
        </template>
        <el-input v-model="apiServer" style="width:200px" @blur="handleApiServerBlur" />
      </el-form-item>
    </el-form>
    <div :id="id" :class="className" :style="{ height: height, width: width }" />
  </div>
</template>

<script lang="ts">
import { ref, markRaw, onMounted, onUnmounted, defineComponent, computed } from 'vue';
import * as echarts from 'echarts';
import axios from 'axios';
// import { $t, getLang } from '@/lang'
import { parseTime } from '@/utils/common';
import { isEmpty } from '@/utils/common';
// 这里不能引入ElMessage，否则样式丢失
// import { ElMessage } from 'element-plus';
import NP from 'number-precision';
NP.enableBoundaryChecking(false);

export default defineComponent({
  name: 'PageSpectrumHome',
  props: {
    className: {
      type: String,
      default: 'chart'
    },
    width: {
      type: String,
      default: '100%'
    },
    height: {
      type: String,
      default:'calc(100% - 128px)'
    },
    id: {
      type: String,
      default: () => `chart_${(Math.random() * 10000).toFixed()}`
    },
  },
  setup(props) {
    let timer = null;
    let myChart = null;
    const apiServer = ref('http://192.168.168.2')
    const saveBtnLoading = ref(false);
    const scanEnable = ref(true);
    const threshold = ref(10);
    const isSingleVal = ref(null);
    const intervalTime = ref(5);
    const bandWidth = ref(16);
    const scanFreq = ref(1450);
    const singleFreq = ref(1451);
    const isEnable = ref(true);
    const startFreq = computed(() => {
      return scanFreq.value - bandWidth.value / 2
    })
    const resolution = ref(0);

    onMounted(() => {
      apiServer.value = localStorage.getItem('apiServer') || 'http://192.168.168.2'
      initChartData();
      initTask();
    });
    onUnmounted(() => {
      cleanTimer();
    });

    function initTask() {
      queryStSnrRate();
      cleanTimer();
      timer = setInterval(() => {
        queryStSnrRate()
      }, (intervalTime.value + 2) * 1000)
    }
    // 清理定时器
    function cleanTimer() {
      clearInterval(timer)
    }
    function initChartData() {
      const chartDom = document.getElementById(props.id)
      myChart = markRaw(
        // echarts.init(chartDom, 'walden', {
        //   locale: getLang()
        // })
        echarts.init(chartDom, 'walden')
      )
      const options = {
        grid: {
          bottom: '10%'
        },
        title: {
          text: '频谱图',
          left: 'center',
        },
        tooltip: {
          trigger: "axis",
          position: function (pt) {
            return [pt[0], "10%"];
          },
        },
        xAxis: {
          type: "category",
          name: 'MHz',
          // nameLocation: 'start',
          // nameGap: 50,
          nameTextStyle: {
            // fontSize: 12,
            verticalAlign: 'bottom',
            padding: [0, 0, -32, 0]
          },
          boundaryGap: false,
          axisLabel: {
            formatter: (value, index) => {
              return NP.round(value * resolution.value + startFreq.value, 2)
            }
          },
        },
        yAxis: [
          {
            type: "value",
            position: 'left',
            name: '功率',
            // boundaryGap: ['2%', "20%"],
            boundaryGap: [0, "100%"],
            // min: 'dataMin',
            // max: 'dataMax',
            // max: function(value) {
            //   return value.max + 10000
            // },
          },
          {
            type: "value",
            name: '功率log',
            position: 'right',
            alighTicks: true,
            axisLabel: {
              formatter: '{value} dB'
            },
            // boundaryGap: ['2%', "20%"],
            boundaryGap: [0, "100%"],
            // min: 'dataMin',
            // max: 'dataMax',
            // max: function(value) {
            //   return value.max + 10000
            // },
          }
        ],
        dataZoom: [
          {
            type: "inside",
            start: 40,
            end: 60,
          },
          {
            start: 40,
            end: 60,
            top: '94%',
            bottom: 10
          },
        ],
        series: [
          {
            name: '功率',
            yAxisIndex: 0,
            type: "line",
            symbol: "circle",
            sampling: "lttb",
            itemStyle: {
              color: "rgb(255, 70, 131)",
            },
            data: [],
          },
          {
            name: '功率log',
            yAxisIndex: 1,
            type: "line",
            symbol: "circle",
            sampling: "lttb",
            itemStyle: {
              color: "#7581BD",
            },
            data: [],
          },
        ],
      }
      myChart.setOption(options)
      // resize自适应
      window.addEventListener('resize', () => {
        myChart.resize()
      })
    }
    // 计算平均功率
    function calculateAveragePower(powerValues) {
        console.log('powerValues.length',powerValues.reduce((sum, value) => NP.plus(sum, value), 0), powerValues.length);
        return powerValues.reduce((sum, value) => sum + value, 0) / powerValues.length;
    }

    // 计算标准差
    function calculateStandardDeviation(powerValues, averagePower) {
        const variance = powerValues.reduce((sum, value) => sum + Math.pow(value - averagePower, 2), 0) / powerValues.length;
        return Math.sqrt(variance);
    }

    // 找到最大功率及其索引
    function findMaxPowerIndex(powerValues) {
        let maxIndex = 0;
        let maxValue = powerValues[0];
        for (let i = 1; i < powerValues.length; i++) {
            if (powerValues[i] > maxValue) {
                maxValue = powerValues[i];
                maxIndex = i;
            }
        }
        return { maxIndex, maxValue };
    }

    // 判断是否为单载波信号
    function isSingleCarrier(powerValues, threshold) {
        const averagePower = calculateAveragePower(powerValues);
        console.log('averagePower', averagePower);
        const stdDev = calculateStandardDeviation(powerValues, averagePower);
        const { maxIndex, maxValue } = findMaxPowerIndex(powerValues);

        // 判断标准差是否足够大，以及最大功率是否显著高于平均值
        const isHighStdDev = stdDev > threshold * averagePower;
        const isHighMaxValue = maxValue > threshold * averagePower;
        console.log('stdDev maxValue', stdDev, maxValue)

        return isHighStdDev && isHighMaxValue;
    }

    // 判断是否为单载波信号
    function isSingleCarrier2(powerValues, threshold) {
      console.log('powerValues.length', powerValues.length);
      // 分辨率，求间隔
      resolution.value = NP.divide(bandWidth.value, powerValues.length - 1);
      // 最大功率索引
      const { maxIndex, maxValue } = findMaxPowerIndex(powerValues);
      console.log('maxIndex', maxIndex, maxValue);

      // 起始频点
      // const startFreq = scanFreq.value - bandWidth.value / 2;
      // 最大索引位置频点
      const maxIndexPreq = resolution.value * maxIndex + startFreq.value;
      console.log('maxIndexPreq', maxIndexPreq)

      // 和单载波中心频点差绝对值
      const singleDiff = Math.abs(NP.minus(maxIndexPreq, singleFreq.value))

      // 比较值
      const compVal = singleDiff < resolution.value;
      console.log('singleDiff < resolution', compVal, singleDiff, resolution.value);
      return compVal;
    }

    // 保存配置
    function handleSaveClick() {
      saveBtnLoading.value = true

      axios.post(`${apiServer.value}/action/shelltool`, {
        set: `rxcfg -s s,id=${0},freq=${NP.times(scanFreq.value, 1000)},band=${NP.divide(NP.times(bandWidth.value, 1000), 2)}`
      }).then(res => {
        console.log('rxcfg axios then res', res);
        ElMessage.success('设置成功')
        saveBtnLoading.value = false;
      }).catch(err => {
        console.log('rxcfg axios catch err', err);
        ElMessage.error('设置失败')
        saveBtnLoading.value = false;
      })

      axios.post(`${apiServer.value}/action/shelltool`, {
        set: `spectrumcfg -s s,enable=${scanEnable.value},cycle=${NP.times(intervalTime.value, 1000)}`
      }).then(res => {
        console.log('spectrumcfg axios then res', res);
        ElMessage.success('设置成功')
        saveBtnLoading.value = false;
      }).catch(err => {
        console.log('spectrumcfg axios catch err', err);
        ElMessage.error('设置失败')
        saveBtnLoading.value = false;
      })
    }

    function queryStSnrRate() {
      axios.get(`${apiServer.value}/action/shelltool?get=mdata;rxinfo;spectrumcfg;`).then(resAxios => {
        const res = resAxios.data;
        console.log('query fetch res json', res);
        // 功率值
        let power = 0;
        if (!isEmpty(res.rxinfo)) {
          const rxItem = res.rxinfo[0]
          power = rxItem.power
          bandWidth.value = NP.divide(rxItem.band, 1000) * 2
          scanFreq.value = NP.divide(rxItem.freq, 1000)
        }
        // 配置项
        if (!isEmpty(res.spectrumcfg)) {
          const specItem = res.spectrumcfg
          intervalTime.value = NP.divide(specItem.cycle, 1000)
          scanEnable.value = specItem.enable
        }
        const { data, time, type } = res.mdata
        const dataArr = data.split('|')
        const pinpuData1 = []
        const pinpuData2 = []
        const powerArrData = []
        for (let i = 0; i < dataArr.length; ++i) {
          let powerVal = NP.round(Math.log10(parseInt(dataArr[i]) / 4096.0) * 10 + parseFloat(power), 2);
          if (powerVal === -Infinity) {
            powerVal = 0;
          }

          // pinpuData1.push({
          //     name: i,
          //     value: [i, parseInt(dataArr[i])],
          // });
          pinpuData2.push({
              name: i,
              value: [i, powerVal],
          });
          powerArrData.push(powerVal);
        }
        if (isEnable.value) {
          isSingleVal.value = isSingleCarrier2(powerArrData, threshold.value);
        }

        // if (pinpuData1.length > 20) {
        //   pinpuData1.shift()
        // }

        if (myChart) {
          myChart.setOption({
            ...myChart.getOption(),
            title: {
              text: `频谱图（${parseTime(new Date(), '{y}-{m}-{d} {h}:{i}:{s}')}）`,
              left: 'center',
            },
            series: [
            {
              name: '功率',
              type: "line",
              yAxisIndex: 0,
              symbol: "circle",
              sampling: "lttb",
              itemStyle: {
                color: "rgb(255, 70, 131)",
              },
              data: pinpuData1,
            },
            {
              name: '功率log',
              type: "line",
              yAxisIndex: 1,
              symbol: "circle",
              sampling: "lttb",
              itemStyle: {
                color: "#7581BD",
              },
              data: pinpuData2,
            },
            ]
          }, true)
        }
      }).catch(err => {
        ElMessage.error('请求数据异常，请检查IP地址及网络')
      })
    }

    function handleApiServerBlur() {
      if (!isEmpty(apiServer.value)) {
        localStorage.setItem('apiServer', apiServer.value)
      }
    }
    return {
      apiServer,
      saveBtnLoading,
      scanEnable,
      startFreq,
      isEnable,
      scanFreq,
      singleFreq,
      bandWidth,
      intervalTime,
      threshold,
      isSingleVal,
      handleSaveClick,
      handleApiServerBlur,
    }
  }
});
</script>
