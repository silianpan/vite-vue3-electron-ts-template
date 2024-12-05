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
        <el-input type="number" v-model="scanFreq" style="width:130px" :step="0.1" :precision="3" @blur="handleBlurSaveLocal('scanFreq', scanFreq)">
          <template #suffix>
            <span>MHz</span>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item style="margin-right:10px">
        <template #label>
          <span style="font-size:16px">{{'带宽:'}}</span>
        </template>
        <el-input type="number" v-model="bandWidth" style="width:130px" :step="0.1" :precision="3" @blur="handleBlurSaveLocal('bandWidth', bandWidth)">
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
        <el-input type="number" v-model="intervalTime" style="width:130px" :step="0.1" :precision="3" @blur="handleBlurSaveLocal('intervalTime', intervalTime)">
          <template #suffix>
            <span>秒(s)</span>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item style="margin-right:10px">
        <template #label>
          <span style="font-size:16px">{{'开关:'}}</span>
        </template>
        <el-switch v-model="scanEnable" active-value="on" inactive-value="off" @change="handleBlurSaveLocal('scanEnable', scanEnable)" />
      </el-form-item>
      <!-- <el-form-item style="margin-right:10px">
        <el-button type="primary" :loading="saveBtnLoading" @click="handleSaveClick">保存配置</el-button>
      </el-form-item> -->
    </el-form>
    <el-form inline>
      <el-form-item style="margin-right:20px">
        <template #label>
          <span style="font-size:16px">{{'设备标识:'}}</span>
        </template>
        <el-input v-model="pcba" style="width:130px" @blur="handlePcbaClick" @keyup.enter="handlePcbaClick" />
        <span style="margin-left:8px">{{ pcbaQuery }}</span>
      </el-form-item>
      <el-form-item>
        <template #label>
          <span style="font-size:16px">{{'Telnet开关:'}}</span>
        </template>
        <div style="font-size:16px;margin-left:10px">
          <span :style="{color: telnetd_enable == 'on' ? 'green' : 'red'}">{{`${telnetd_enable == 'on' ? '开' : '关'}`}}</span>
        </div>
      </el-form-item>
      <el-form-item>
        <template #label>
          <span style="font-size:16px">{{'ODU馈电电压:'}}</span>
        </template>
        <div style="font-size:16px;margin-left:10px">
          <span :style="{color: lnb_pwr != 'off' ? 'green' : 'red'}">{{`${lnb_pwr_map[lnb_pwr]}`}}</span>
        </div>
      </el-form-item>
      <el-form-item style="margin-right:10px">
        <template #label>
          <span style="font-size:16px">{{'IP地址:'}}</span>
        </template>
        <el-input v-model="apiServer" style="width:200px" @blur="handleBlurSaveLocal('apiServer', apiServer)" />
      </el-form-item>
      <el-form-item style="margin-right:10px">
        <template #label>
          <span style="font-size:16px">{{'记录路径：'}}</span>
        </template>
        <el-input v-model="recordFilePath" style="width:240px" @blur="handleBlurSaveLocal('recordFilePath', recordFilePath)" />
      </el-form-item>
    </el-form>
    <el-form inline>
      <el-form-item>
        <template #label>
          <span style="font-size:16px">{{'单载波检测:'}}</span>
        </template>
        <!-- <el-switch v-model="isEnable" :active-value="true" :inactive-value="false" /> -->
      </el-form-item>
      <el-form-item style="margin-right:10px">
        <template #label>
          <span style="font-size:16px">{{'频点:'}}</span>
        </template>
        <el-input type="number" v-model="singleFreq" style="width:130px" :disabled="!isEnable" :step="0.1" :precision="3" @blur="handleBlurSaveLocal('singleFreq', singleFreq)">
          <template #suffix>
            <span>MHz</span>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item style="margin-right:10px">
        <template #label>
          <span style="font-size:16px">{{'区间:'}}</span>
        </template>
        <el-input type="number" v-model="blasFreq" style="width:130px" :disabled="!isEnable" :step="0.1" :precision="3" @blur="handleBlurSaveLocal('blasFreq', blasFreq)">
          <template #suffix>
            <span>KHz</span>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item>
        <template #label>
          <span style="font-size:16px">{{'下门限:'}}</span>
        </template>
        <div style="display:flex">
          <el-input type="number" v-model="thresholdMin" style="width:130px" :step="0.1" :precision="3" @blur="handleBlurSaveLocal('thresholdMin', thresholdMin)">
            <template #suffix>
              <span>dB</span>
            </template>
          </el-input>
        </div>
      </el-form-item>
      <el-form-item>
        <template #label>
          <span style="font-size:16px">{{'上门限:'}}</span>
        </template>
        <div style="display:flex">
          <el-input type="number" v-model="thresholdMax" style="width:130px" :step="0.1" :precision="3" @blur="handleBlurSaveLocal('thresholdMax', thresholdMax)">
            <template #suffix>
              <span>dB</span>
            </template>
          </el-input>
          <div style="font-size:16px;margin-left:20px">
            <span :style="{color: isSingleVal ? 'green' : 'red'}">{{`${isSingleVal ? '是' : '否'}单载波`}}</span>
          </div>
        </div>
      </el-form-item>
      <el-form-item style="margin-right:10px">
        <el-button type="primary" @click="handleRecordClick">记录</el-button>
      </el-form-item>
    </el-form>
    <div :id="id" :class="className" :style="{ height: height, width: width }" />
  </div>
</template>

<script lang="ts">
// import { ipcRenderer } from 'electron';
import { ref, markRaw, onMounted, onUnmounted, defineComponent, computed, getCurrentInstance, watch } from 'vue';
import * as echarts from 'echarts';
// import { $t, getLang } from '@/lang'
import { parseTime } from '@/utils/common';
import { isEmpty } from '@/utils/common';
// 这里不能引入ElMessage，否则样式丢失
// import { ElMessage } from 'element-plus';
import NP from 'number-precision';
NP.enableBoundaryChecking(false);
import axios from 'axios';
axios.defaults.timeout = 3000;
import OduForm from '../odu/OduForm.vue';
import TelnetForm from '../telnet/TelnetForm.vue';

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
      default:'calc(100% - 168px)'
    },
    id: {
      type: String,
      default: () => `chart_${(Math.random() * 10000).toFixed()}`
    },
  },
  setup(props) {
    const currentInstance = getCurrentInstance();
    const pcba = ref(0)
    const pcbaQuery = ref(0)
    const maxPowerLogIndex = ref(null)
    const maxPowerLogVal = ref(null)
    const checkTime = ref('')
    let timer = null;
    let myChart = null;
    const telnetd_enable = ref('off')
    const lnb_pwr = ref('off')
    const lnb_pwr_map = {
      off: '关',
      on_13: '13V',
      on_18: '18V',
    }
    const apiServer = ref(localStorage.getItem('apiServer') || 'http://192.168.1.104')
    const recordFilePath = ref(localStorage.getItem('recordFilePath') || '')
    const recordFileName = ref('设备检测结果.csv')
    const scanFreq = ref(localStorage.getItem('scanFreq') || 1697);
    const bandWidth = ref(localStorage.getItem('bandWidth') || 16);
    const intervalTime = ref(localStorage.getItem('intervalTime') || 5);
    const scanEnable = ref(localStorage.getItem('scanEnable') || 'on');
    const singleFreq = ref(localStorage.getItem('singleFreq') || 1697); 
    const blasFreq = ref(localStorage.getItem('blasFreq') || 0);
    const thresholdMin = ref(localStorage.getItem('thresholdMin') || 0);
    const thresholdMax = ref(localStorage.getItem('thresholdMax') || 0);
    const maxValueY = ref(0);
    const saveBtnLoading = ref(false);
    const isSingleVal = ref(null);
    const isEnable = ref(true);
    const startFreq = computed(() => {
      return scanFreq.value - bandWidth.value / 2
    })
    const resolution = ref(0);

    onMounted(() => {
      recordFilePath.value = window.fileAPI.getUserDir();
      window.electronAPI.onSettingOdu(() => {
        currentInstance?.appContext.config.globalProperties.$createEleModal({
          modalProps: {
            width: '40%',
            closeOnClickModal: false,
            title: 'ODU配置',
          },
          content: {
            template: OduForm,
            props: {
              apiServer: apiServer.value,
            }
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
            props: {
              apiServer: apiServer.value,
            }
          },
          onOk: () => {}
        })
      });
      initChartData();
      initTask();
    });
    onUnmounted(() => {
      cleanTimer();
    });
    // watch(() => maxPowerLogIndex.value, (val) => {
    //   if (myChart && !isEmpty(val)) {
    //     myChart.dispatchAction({
    //         type: 'showTip',
    //         seriesIndex: 1,
    //         dataIndex: val 
    //     });
    //   }
    // })

    function initTask() {
      queryStSnrRate();
      queryTelnetCfg();
      queryOduCfg();
      handleAutoOpenTelnet();
      handleAutoOpenOdu();
      cleanTimer();
      timer = setInterval(() => {
        queryStSnrRate()
        queryTelnetCfg()
        queryOduCfg();
        handleAutoOpenTelnet();
        handleAutoOpenOdu();
      }, intervalTime.value * 1000)
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
          alwaysShowContent: true,
          // position: function (pt) {
          //   return [pt[0], "10%"];
          // },
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
            interval: 10,
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
            end: 70,
          },
          {
            start: 40,
            end: 70,
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
    // function calculateAveragePower(powerValues) {
    //     return powerValues.reduce((sum, value) => sum + value, 0) / powerValues.length;
    // }

    // 计算标准差
    // function calculateStandardDeviation(powerValues, averagePower) {
    //     const variance = powerValues.reduce((sum, value) => sum + Math.pow(value - averagePower, 2), 0) / powerValues.length;
    //     return Math.sqrt(variance);
    // }

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
    // function isSingleCarrier(powerValues, thresholdMin) {
    //     const averagePower = calculateAveragePower(powerValues);
    //     const stdDev = calculateStandardDeviation(powerValues, averagePower);
    //     const { maxIndex, maxValue } = findMaxPowerIndex(powerValues);

    //     // 判断标准差是否足够大，以及最大功率是否显著高于平均值
    //     const isHighStdDev = stdDev > thresholdMin * averagePower;
    //     const isHighMaxValue = maxValue > thresholdMin * averagePower;

    //     return isHighStdDev && isHighMaxValue;
    // }

    // 判断是否为单载波信号
    // function isSingleCarrier2(powerValues) {
    //   // 分辨率，求间隔
    //   resolution.value = NP.divide(bandWidth.value, powerValues.length - 1);
    //   // 最大功率索引
    //   const { maxIndex, maxValue } = findMaxPowerIndex(powerValues);
    //   maxPowerLogIndex.value = maxIndex;
    //
    //   // 起始频点
    //   // const startFreq = scanFreq.value - bandWidth.value / 2;
    //   // 最大索引位置频点
    //   const maxIndexFreq = resolution.value * maxIndex + startFreq.value;
    //
    //   // 和单载波中心频点差绝对值
    //   const singleDiff = Math.abs(NP.minus(maxIndexFreq, singleFreq.value));
    //
    //   // 算上偏差的分辨率
    //   const resolBla = resolution.value + NP.divide(blasFreq.value, 1000);
    //   // 比较值
    //   const compVal = singleDiff < resolBla;
    //   return compVal;
    // }

    function isSingleCarrier3(powerValues) {
      // 分辨率，求间隔
      resolution.value = NP.divide(bandWidth.value, powerValues.length - 1);
      // 最大功率索引
      const { maxIndex, maxValue } = findMaxPowerIndex(powerValues);
      maxPowerLogIndex.value = maxIndex;
      maxValueY.value = maxValue;

      // 起始频点
      // const startFreq = scanFreq.value - bandWidth.value / 2;
      // 最大索引位置频点
      const maxIndexFreq = resolution.value * maxIndex + startFreq.value;
      maxPowerLogVal.value = maxIndexFreq;
      console.log('max index value freq', maxIndex, maxValue, maxIndexFreq);

      // x -> {频点+区间}
      const qujianFreq = NP.divide(blasFreq.value, 1000);
      const isCon1 = maxIndexFreq >= NP.minus(singleFreq.value, qujianFreq) &&
        maxIndexFreq <= NP.plus(singleFreq.value, qujianFreq);

      // y -> {上门限,下门限}
      const isCon2 = maxValue >= thresholdMin.value && maxValue <= thresholdMax.value;
      console.log('isCon1 isCon2', isCon1, isCon2);
      checkTime.value = parseTime(new Date(), '{y}-{m}-{d} {h}:{i}:{s}')
      return isCon1 && isCon2;
    }

    // 保存配置
    function handleSaveClick(rxcfgVal = true, spectrumcfgVal = true) {
      saveBtnLoading.value = true

      if (rxcfgVal) {
        axios.post(`${apiServer.value}/action/shelltool`, {
          set: `rxcfg -s s,id=${0},enable=on,specinv=1,freq=${NP.times(scanFreq.value, 1000)},band=${NP.divide(NP.times(bandWidth.value, 1000), 2)}`
        }, {
          headers: {
            "Content-Type": "multipart/form-data" 
          }
        }).then(res => {
          ElMessage.success('rxcfg设置成功')
          saveBtnLoading.value = false;
        }).catch(err => {
          ElMessage.error('rxcfg设置失败')
          saveBtnLoading.value = false;
        })
      }

      if (spectrumcfgVal) {
        axios.post(`${apiServer.value}/action/shelltool`, {
          set: `spectrumcfg -s s,enable=${scanEnable.value},cycle=${NP.times(intervalTime.value, 1000)}`
        }, {
          headers: {
            "Content-Type": "multipart/form-data" 
          }
        }).then(res => {
          ElMessage.success('spectrumcfg设置成功')
          saveBtnLoading.value = false;
        }).catch(err => {
          ElMessage.error('spectrumcfg设置失败')
          saveBtnLoading.value = false;
        })
      }
    }

    function queryStSnrRate() {
      axios.get(`${apiServer.value}/action/shelltool?get=mdata;rxinfo;spectrumcfg;`).then(resAxios => {
        const res = resAxios.data;
        // 功率值
        let power = 0;
        if (!isEmpty(res.rxinfo)) {
          const rxItem = res.rxinfo[0]
          power = rxItem.power

          const tmpBandWidth = NP.divide(rxItem.band, 1000) * 2
          const tmpScanFreq = NP.divide(rxItem.freq, 1000)

          if (tmpBandWidth != bandWidth.value || tmpScanFreq != scanFreq.value || rxItem.enable != 'on' || rxItem.specinv != '1') {
            // 保存
            handleSaveClick(true, false)
          } else {
            bandWidth.value = tmpBandWidth
            scanFreq.value = tmpScanFreq
          }
        }
        // 配置项
        if (!isEmpty(res.spectrumcfg)) {
          const specItem = res.spectrumcfg
          const tmpIntervalTime = NP.divide(specItem.cycle, 1000)
          const tmpScanEnable = specItem.enable

          if (tmpIntervalTime != intervalTime.value || tmpScanEnable != scanEnable.value) {
            // 保存
            handleSaveClick(false, true)
          } else {
            intervalTime.value = tmpIntervalTime
            scanEnable.value = tmpScanEnable
          }
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
          isSingleVal.value = isSingleCarrier3(powerArrData);
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
          if (!isEmpty(maxPowerLogIndex.value)) {
            myChart.dispatchAction({
                type: 'showTip',
                seriesIndex: 1,
                dataIndex: maxPowerLogIndex.value 
            });
          }
        }
      }).catch(err => {
        ElMessage.error('请求数据异常，请检查IP地址及网络');
        cleanLocalData();
      })
    }

    function cleanLocalData() {
      // 校验单载波为false
      // isSingleCarrier.value = false
      // 清理图形数据
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
            data: [],
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
            data: [],
          },
          ]
        }, true)
      }
      
    }

    function handleBlurSaveLocal(key, value) {
      if (!isEmpty(value)) {
        localStorage.setItem(key, value)
      }
    }

    function handleAutoOpenTelnet() {
      const local_telnetd_enable = localStorage.getItem('setting-telnet-telnetd_enable') || 'on'
      if (telnetd_enable.value == local_telnetd_enable) {
        return
      }
      axios
        .post(
          `${apiServer.value}/action/shelltool`,
          {
            set: `telnetdcfg -s s,telnetd_enable=${local_telnetd_enable}`,
          },
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        )
        .then((res) => {
          // ElMessage.success("设置成功");
        })
        .catch((err) => {
        });
    }
    function handleAutoOpenOdu() {
      const local_lnb_pwr = localStorage.getItem('setting-odu-lnb_pwr') || 'on_13';
      if (lnb_pwr.value == local_lnb_pwr) {
        return
      }
      axios
        .post(
          `${apiServer.value}/action/shelltool`,
          {
            set: `oducfg -s s,lnb_pwr=${local_lnb_pwr}`,
          },
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        )
        .then((res) => {
        })
        .catch((err) => {
        });
    }
    function queryTelnetCfg() {
      axios
        .get(`${apiServer.value}/action/shelltool?get=telnetdcfg;`)
        .then((resAxios) => {
          const res = resAxios.data;
          if (!isEmpty(res.telnetdcfg)) {
            telnetd_enable.value = res.telnetdcfg.telnetd_enable;
          }
        })
        .catch((err) => {
          ElMessage.error("请求数据异常，请检查IP地址及网络");
        });
    }
    function queryOduCfg() {
      axios
        .get(`${apiServer.value}/action/shelltool?get=oducfg;`)
        .then((resAxios) => {
          const res = resAxios.data;
          if (!isEmpty(res.oducfg)) {
            lnb_pwr.value = res.oducfg.lnb_pwr;
            pcbaQuery.value = res.oducfg.pcba || 0;
          }
        })
        .catch((err) => {
          ElMessage.error("请求数据异常，请检查IP地址及网络");
        });
    }
    function handlePcbaClick() {
      if (isEmpty(pcba.value) || pcba.value == 0) {
        return
      }
      axios
        .post(
          `${apiServer.value}/action/shelltool`,
          {
            set: `oducfg -s s,pcba=${pcba.value}`,
          },
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        )
        .then((res) => {
          ElMessage.success('设备标识设置成功')
        })
        .catch((err) => {
          ElMessage.error('设备标识设置失败')
        });
    }
    function handleRecordClick() {
      if (window.fileAPI) {
        console.log('写文件')
        const str = `${pcba.value},${isSingleVal.value ? 'pass' : 'fail'},${NP.round(maxPowerLogVal.value, 2)}MHz,${maxValueY.value}dB,${singleFreq.value}MHz/${blasFreq.value}KHz,${thresholdMin.value}~${thresholdMax.value}dB,${checkTime.value}`
        window.fileAPI.appendToFile(recordFilePath.value, recordFileName.value, str);
      } else {
        console.error('fileAPI is not available');
      }
    }
    function handleRecordFilePathBlur() {}
    return {
      pcba,
      pcbaQuery,
      telnetd_enable,
      lnb_pwr,
      lnb_pwr_map,
      apiServer,
      recordFilePath,
      saveBtnLoading,
      scanEnable,
      startFreq,
      isEnable,
      scanFreq,
      singleFreq,
      bandWidth,
      intervalTime,
      thresholdMin,
      thresholdMax,
      isSingleVal,
      blasFreq,
      handleSaveClick,
      handleRecordClick,
      handleBlurSaveLocal,
      handleRecordFilePathBlur,
      handlePcbaClick,
    }
  }
});
</script>
