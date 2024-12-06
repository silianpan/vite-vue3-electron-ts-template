<template>
  <div style="position:absolute;top:10px;bottom:10px;left:0;right:0;">
    <div style="display:flex;justify-content:center;padding:10px">
      <el-descriptions border size="large" :column="3" title="频谱扫描参数">
        <el-descriptions-item v-for="(item, key) in scanFormData" :key="key" :label="item.label">
          <span :style="{color: item.color ? item.color(item.value) : null}">
            {{ item.formater ? item.formater(item.value) : item.unit ? `${item.value} ${item.unit}` : item.value }}
          </span>
        </el-descriptions-item>
      </el-descriptions>
      <el-descriptions border size="large" :column="3" title="检测参数">
        <el-descriptions-item v-for="(item, key) in checkFormData" :key="key" :label="item.label">
          <span :style="{color: item.color ? item.color(item.value) : null}">
            {{ item.formater ? item.formater(item.value) : item.unit ? `${item.value} ${item.unit}` : item.value }}
          </span>
        </el-descriptions-item>
      </el-descriptions>
    </div>
    <el-form inline>
      <el-form-item style="margin-right:40px">
        <template #label>
          <span style="font-size:16px;font-weight:700">{{'设备标识:'}}</span>
        </template>
        <el-input v-model="pcba" style="width:300px" @blur="handlePcbaClick" @keyup.enter="handlePcbaClick" />
        <span style="margin-left:8px">{{ pcbaQuery }}</span>
      </el-form-item>
      <el-form-item style="margin-right:40px">
        <template #label>
          <span style="font-size:16px;font-weight:700">{{'记录路径：'}}</span>
        </template>
        <span>{{ recordFilePath }}</span>
      </el-form-item>
      <el-form-item style="margin-right:40px">
        <span :style="{color:isSingleVal && pcbaQuery != '0' ? 'green' : 'red', fontSize: '20px', fontWeight: 700}">{{ pcbaQuery == '0' ? '不可记录' : isSingleVal ? '成功' : '失败'}}</span>
      </el-form-item>
      <el-form-item>
        <el-button style="width:160px" size="large" type="primary" @click="handleRecordClick">
          <span style="font-size:20px;">记录</span>
        </el-button>
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
import ScanForm from '../scan/ScanForm.vue';
import CheckForm from '../check/CheckForm.vue';

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
      default:'calc(100% - 220px)'
    },
    id: {
      type: String,
      default: () => `chart_${(Math.random() * 10000).toFixed()}`
    },
  },
  setup(props) {
    const currentInstance = getCurrentInstance();
    const pcba = ref('0')
    const pcbaQuery = ref('0')
    const maxPowerLogIndex = ref(null)
    const maxPowerLogVal = ref(null)
    const checkTime = ref('')
    let timer = null;
    let myChart = null;
    const local_telnetd_enable = ref('')
    const local_lnb_pwr = ref('')
    const lnb_pwr_map = {
      off: '关',
      on_13: '13V',
      on_18: '18V',
    }

    const scanFormData = ref({
      scanFreq: {
        label: '中心频点',
        value: localStorage.getItem('scanFreq') || 1697,
        unit: 'MHz',
      },
      bandWidth: {
        label: '带宽',
        value: localStorage.getItem('bandWidth') || 16,
        unit: 'MHz',
      },
      startFreq: {
        label: '起始频点',
        value: '',
        formater: (val) => {
          const compVal = scanFormData.value.scanFreq.value - scanFormData.value.bandWidth.value / 2;
          return `${compVal} MHz`;
        }
      },
      intervalTime: {
        label: '刷新频率',
        value: localStorage.getItem('intervalTime') || 5,
        unit: '秒(s)',
      },
      scanEnable: {
        label: '开关',
        value: localStorage.getItem('scanEnable') || 'on',
        color: (val) => {
          return val === 'on' ? 'green' : 'red'
        },
        formater: (val) => {
          return val === 'on' ? '开' : '关' 
        }
      },
      apiServer: {
        label: 'IP地址',
        value: localStorage.getItem('apiServer') || 'http://192.168.1.104',
      },
    });

    const checkFormData = ref({
      singleFreq: {
        label: '频点',
        value: localStorage.getItem('singleFreq') || 1697,
        unit: 'MHz',
      },
      blasFreq: {
        label: '区间',
        value: localStorage.getItem('blasFreq') || 0, 
        unit: 'KHz',
      },
      thresholdMin: {
        label: '下门限',
        value: localStorage.getItem('thresholdMin') || 0,
        unit: 'dB',
      },
      thresholdMax: {
        label: '上门限',
        value: localStorage.getItem('thresholdMax') || 0,
        unit: 'dB',
      },
      telnetd_enable: {
        label: 'Telnet开关',
        value: localStorage.getItem('telnetd_enable'),
        color: (val) => {
          return val === 'on' ? 'green' : 'red'
        },
        formater: (val) => {
          return val === 'on' ? '开' : '关' 
        }
      },
      lnb_pwr: {
        label: 'ODU馈电电压',
        value: localStorage.getItem('lnb_pwr'),
        color: (val) => {
          return val !== 'off' ? 'green' : 'red'
        },
        formater: (val) => {
          return lnb_pwr_map[val] 
        }
      },
    });

    const recordFilePath = ref('')
    const recordFileName = ref('设备检测结果.csv')
    const maxValueY = ref(0);
    const saveBtnLoading = ref(false);
    const isSingleVal = ref(null);
    const isEnable = ref(true);
    const resolution = ref(0);

    const startFreq = computed(() => scanFormData.value.scanFreq.value - scanFormData.value.bandWidth.value / 2);

    onMounted(() => {
      recordFilePath.value = localStorage.getItem('recordFilePath') || window.fileAPI.getUserDir();
      initChartData();
      initTask();

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
          onOk: () => {
            console.log('odu ok')
            updateCheckFormData();
          }
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
          onOk: () => {
            console.log('telnet ok')
            updateCheckFormData();
          }
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
          onOk: () => {
            console.log('scan ok')
            updateScanFormData();
          }
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
          onOk: () => {
            console.log('check ok')
            updateCheckFormData();
          }
        })
      });
    });
    onUnmounted(() => {
      cleanTimer();
    });

    function updateScanFormData() {
      for (let key in scanFormData.value) {
        scanFormData.value[key].value = localStorage.getItem(key)
      }
    }
    function updateCheckFormData() {
      for (let key in checkFormData.value) {
        checkFormData.value[key].value = localStorage.getItem(key)
      }
    }

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
      }, scanFormData.value.intervalTime.value * 1000)
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
          formatter: (params) => {
            if (!isEmpty(params)) {
              const item = params[0]
              const x = resolution.value * item.value[0] + startFreq.value
              const y = item.value[1]
              return `${item.marker} ${item.seriesName}<p>${NP.round(x, 2)} MHz : ${y} dB</p>`
            }
          } 
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
            name: '功率计算值',
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
            name: '功率计算值',
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
    //   resolution.value = NP.divide(scanFormData.value.bandWidth.value, powerValues.length - 1);
    //   // 最大功率索引
    //   const { maxIndex, maxValue } = findMaxPowerIndex(powerValues);
    //   maxPowerLogIndex.value = maxIndex;
    //
    //   // 起始频点
    //   // const startFreq = scanFormData.value.scanFreq.value - scanFormData.value.bandWidth.value / 2;
    //   // 最大索引位置频点
    //   const maxIndexFreq = resolution.value * maxIndex + startFreq.value;
    //
    //   // 和单载波中心频点差绝对值
    //   const singleDiff = Math.abs(NP.minus(maxIndexFreq, checkFormData.value.singleFreq.value));
    //
    //   // 算上偏差的分辨率
    //   const resolBla = resolution.value + NP.divide(checkFormData.value.blasFreq.value, 1000);
    //   // 比较值
    //   const compVal = singleDiff < resolBla;
    //   return compVal;
    // }

    function isSingleCarrier3(powerValues) {
      // 分辨率，求间隔
      resolution.value = NP.divide(scanFormData.value.bandWidth.value, powerValues.length - 1);
      // 最大功率索引
      const { maxIndex, maxValue } = findMaxPowerIndex(powerValues);
      maxPowerLogIndex.value = maxIndex;
      maxValueY.value = maxValue;

      // 起始频点
      // const startFreq = scanFormData.value.scanFreq.value - scanFormData.value.bandWidth.value / 2;
      // 最大索引位置频点
      const maxIndexFreq = resolution.value * maxIndex + startFreq.value;
      maxPowerLogVal.value = maxIndexFreq;
      console.log('max index value freq', maxIndex, maxValue, maxIndexFreq);

      // x -> {频点+区间}
      const qujianFreq = NP.divide(checkFormData.value.blasFreq.value, 1000);
      const isCon1 = maxIndexFreq >= NP.minus(checkFormData.value.singleFreq.value, qujianFreq) &&
        maxIndexFreq <= NP.plus(checkFormData.value.singleFreq.value, qujianFreq);

      // y -> {上门限,下门限}
      const isCon2 = maxValue >= checkFormData.value.thresholdMin.value && maxValue <= checkFormData.value.thresholdMax.value;
      console.log('isCon1 isCon2', isCon1, isCon2);
      checkTime.value = parseTime(new Date(), '{y}-{m}-{d} {h}:{i}:{s}')
      return isCon1 && isCon2;
    }

    // 保存配置
    function handleSaveClick(rxcfgVal = true, spectrumcfgVal = true) {
      saveBtnLoading.value = true

      if (rxcfgVal) {
        axios.post(`${scanFormData.value.apiServer.value}/action/shelltool`, {
          set: `rxcfg -s s,id=${0},enable=on,freq=${NP.times(scanFormData.value.scanFreq.value, 1000)},band=${NP.divide(NP.times(scanFormData.value.bandWidth.value, 1000), 2)}`
        }, {
          headers: {
            "Content-Type": "multipart/form-data" 
          }
        }).then(res => {
          // ElMessage.success('rxcfg设置成功')
          saveBtnLoading.value = false;
        }).catch(err => {
          ElMessage.error('rxcfg设置失败')
          saveBtnLoading.value = false;
        })
      }

      if (spectrumcfgVal) {
        axios.post(`${scanFormData.value.apiServer.value}/action/shelltool`, {
          set: `spectrumcfg -s s,enable=${scanFormData.value.scanEnable.value},cycle=${NP.times(scanFormData.value.intervalTime.value, 1000)}`
        }, {
          headers: {
            "Content-Type": "multipart/form-data" 
          }
        }).then(res => {
          // ElMessage.success('spectrumcfg设置成功')
          saveBtnLoading.value = false;
        }).catch(err => {
          ElMessage.error('spectrumcfg设置失败')
          saveBtnLoading.value = false;
        })
      }
    }

    function queryStSnrRate() {
      axios.get(`${scanFormData.value.apiServer.value}/action/shelltool?get=mdata;rxinfo;spectrumcfg;`).then(resAxios => {
        const res = resAxios.data;
        // 功率值
        let power = 0;
        if (!isEmpty(res.rxinfo)) {
          const rxItem = res.rxinfo[0]
          power = rxItem.power

          const tmpBandWidth = NP.divide(rxItem.band, 1000) * 2
          const tmpScanFreq = NP.divide(rxItem.freq, 1000)

          if (tmpBandWidth != scanFormData.value.bandWidth.value ||
            tmpScanFreq != scanFormData.value.scanFreq.value ||
            rxItem.enable != 'on') {
            // 保存
            handleSaveClick(true, false)
          }
        }
        // 配置项
        if (!isEmpty(res.spectrumcfg)) {
          const specItem = res.spectrumcfg
          const tmpIntervalTime = NP.divide(specItem.cycle, 1000)
          const tmpScanEnable = specItem.enable

          if (tmpIntervalTime != scanFormData.value.intervalTime.value ||
            tmpScanEnable != scanFormData.value.scanEnable.value) {
            // 保存
            handleSaveClick(false, true)
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
              name: '功率计算值',
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
            name: '功率计算值',
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
      const tmpTelnetdEnable = checkFormData.value.telnetd_enable.value
      if (isEmpty(tmpTelnetdEnable) || local_telnetd_enable.value == tmpTelnetdEnable) {
        return
      }
      axios
        .post(
          `${scanFormData.value.apiServer.value}/action/shelltool`,
          {
            set: `telnetdcfg -s s,telnetd_enable=${tmpTelnetdEnable}`,
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
      const tmpLnbPwr = checkFormData.value.lnb_pwr.value
      if (isEmpty(tmpLnbPwr) || local_lnb_pwr.value == tmpLnbPwr) {
        return
      }
      axios
        .post(
          `${scanFormData.value.apiServer.value}/action/shelltool`,
          {
            set: `oducfg -s s,lnb_pwr=${tmpLnbPwr}`,
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
        .get(`${scanFormData.value.apiServer.value}/action/shelltool?get=telnetdcfg;`)
        .then((resAxios) => {
          const res = resAxios.data;
          if (!isEmpty(res.telnetdcfg)) {
            local_telnetd_enable.value = res.telnetdcfg.telnetd_enable;
          }
        })
        .catch((err) => {
          ElMessage.error("请求数据异常，请检查IP地址及网络");
        });
    }
    function queryOduCfg() {
      axios
        .get(`${scanFormData.value.apiServer.value}/action/shelltool?get=oducfg;`)
        .then((resAxios) => {
          const res = resAxios.data;
          if (!isEmpty(res.oducfg)) {
            local_lnb_pwr.value = res.oducfg.lnb_pwr;
            pcbaQuery.value = res.oducfg.pcba || '0';
          }
        })
        .catch((err) => {
          ElMessage.error("请求数据异常，请检查IP地址及网络");
        });
    }
    function handlePcbaClick() {
      if (isEmpty(pcba.value) || pcba.value == '0') {
        return
      }
      axios
        .post(
          `${scanFormData.value.apiServer.value}/action/shelltool`,
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
        if (pcbaQuery.value == '0') {
          ElMessage.error('设备标识符不能为0')
          return;
        }
        const { singleFreq, blasFreq, thresholdMin, thresholdMax } = checkFormData.value
        const str = `${pcbaQuery.value},${isSingleVal.value ? '成功' : '失败'},${NP.round(maxPowerLogVal.value, 2)}MHz,${maxValueY.value}dB,${singleFreq.value}MHz/${blasFreq.value}KHz,${thresholdMin.value}~${thresholdMax.value}dB,${checkTime.value}`
        window.fileAPI.appendToFile(recordFilePath.value, recordFileName.value, str);
      } else {
        console.error('fileAPI is not available');
      }
    }
    return {
      scanFormData,
      checkFormData,
      pcba,
      pcbaQuery,
      local_telnetd_enable,
      local_lnb_pwr,
      recordFilePath,
      saveBtnLoading,
      startFreq,
      isEnable,
      isSingleVal,
      handleSaveClick,
      handleRecordClick,
      handleBlurSaveLocal,
      handlePcbaClick,
    }
  }
});
</script>
