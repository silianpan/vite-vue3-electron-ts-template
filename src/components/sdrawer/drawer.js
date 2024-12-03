import { createApp, h, ref, onMounted } from 'vue'
// import { plantRenderPara } from '../../utils/gogocodeTransfer'
import { createDrawerSlot } from './createCreateSlot'
import { getSlotPayload } from './getSlotPayload'
import { locationMatcher } from './locationMatcher'
import { setGlobalHeader } from './setGlobalHeader'
import { modifyOptions } from './modifyOptions'
import { ElConfigProvider } from 'element-plus'
// import pluginApi from '@@/plugins'

/**
 * drawerProps 就是组件库的 drawer 支持的props
 * title 和 content 都是对象，其中 template 属性代表组件，其他属性同 vue 的原生属性 https://cn.vuejs.org/v2/guide/render-function.html#%E6%B7%B1%E5%85%A5%E6%95%B0%E6%8D%AE%E5%AF%B9%E8%B1%A1
 */
// 创建抽屉的主方法
export function createDrawer(
  app,
  {
    component: Drawer,
    titleSlotName = 'title', // 原来组件提供的标题插槽名称
    visiblePropName = 'visible', // 原来控制抽屉组件显隐的属性名称
    closeCbName = 'close', // 原来组件的关闭回调事件名称
    router,
    store,
    locale
  },
  options
) {
  const {
    title,
    content,
    drawerProps,
    beforeClose,
    afterClose,
    payloadSlot, // 'default', 'title', false, true
    onClick,
    stopPropagation, // 是否阻止原生click事件冒泡
    hideBottom
  } = options
  const el = document.createElement('div')

  const firstRender = ref(true)
  const visible = ref(false)
  const slotVnMap = ref({})

  const handleNativeClick = (event) => {
    if (stopPropagation) {
      event.stopPropagation()
    }
    onClick && onClick(event)
  }

  const handleClose = async (payload) => {
    if (!visible.value) return
    const slotPayload = await getSlotPayload(slotVnMap.value, payloadSlot)
    beforeClose && (await beforeClose({ payload, slotPayload }))
    visible.value = false
    setTimeout(async () => {
      modalApp.unmount()
      try {
        document.body.removeChild(el)
      } catch (e) {
        // console.error(e)
      }
      afterClose && (await afterClose(payload))
    }, 400)
  }
  const createSlot = createDrawerSlot(h, slotVnMap.value, handleClose)
  const children = {}
  // 如果传了内容
  if (content && content.template) {
    // children.push(createSlot(content))
    children.default = () => createSlot(content)
  }
  // 如果title传了组件，默认用这个
  if (title && title.template) {
    // 如果是插槽的话，就要加slot
    // children.push(createSlot(title, titleSlotName))
    children[titleSlotName] = () => createSlot(title, titleSlotName)
    drawerProps.title && delete drawerProps.title
  }
  const modalApp = createApp({
    setup() {
      onMounted(() => {
        if (firstRender.value) {
          setTimeout(() => {
            visible.value = true
            firstRender.value = false
          }, 0)
        }
      })
      return {
        visible,
        closeCbName,
        handleClose,
        handleNativeClick
      }
    },
    render() {
      return h(
        ElConfigProvider,
        {
          locale
        },
        {
          default: () =>
            h(
              Drawer,
              {
                modalClass: hideBottom === true ? null : 'sdrawer-common-dialog',
                ...drawerProps,
                [visiblePropName]: visible.value,
                [closeCbName]: handleClose,
                onClick: handleNativeClick
              },
              children
            )
        }
      )
    }
  })

  // 注册全局插件
  // pluginApi.registerPlugins(modalApp, router)
  const modules = ['components', 'config', 'directives', 'provides']
  modules.forEach((k) => {
    modalApp._context[k] = app._context[k]
  })

  modalApp.mount(el)
  document.body.appendChild(el)
  return modalApp
}

// 创建 antd drawer 的扩展方法
export const createAntdDrawer = {
  install(Vue, originBaseOption) {
    Vue.config.globalProperties.$createAntdDrawer = function (options, argObj, argLocation) {
      const { location, baseOption } = modifyOptions(originBaseOption, argObj, argLocation)
      const newOptions = locationMatcher.call(this, location, baseOption, options)
      const optionsWithGH = setGlobalHeader(baseOption, newOptions)
      return createDrawer(
        Vue,
        {
          ...baseOption,
          titleSlotName: 'title',
          visiblePropName: 'visible',
          closeCbName: 'close'
        },
        optionsWithGH
      )
    }
  }
}
// 创建 iview drawer 的扩展方法
export const createViewDrawer = {
  install(Vue, originBaseOption) {
    Vue.config.globalProperties.$createViewDrawer = function (options, argObj, argLocation) {
      const { location, baseOption } = modifyOptions(originBaseOption, argObj, argLocation)
      const newOptions = locationMatcher.call(this, location, baseOption, options)
      const optionsWithGH = setGlobalHeader(baseOption, newOptions)
      return createDrawer(
        Vue,
        {
          ...baseOption,
          titleSlotName: 'header',
          visiblePropName: 'value',
          closeCbName: 'on-close'
        },
        optionsWithGH
      )
    }
  }
}
// 创建 ele drawer 的扩展方法
export const createEleDrawer = {
  install(Vue, originBaseOption) {
    Vue.config.globalProperties.$createEleDrawer = function (options, argObj, argLocation) {
      const { location, baseOption } = modifyOptions(originBaseOption, argObj, argLocation)
      const newOptions = locationMatcher.call(this, location, baseOption, options)
      const optionsWithGH = setGlobalHeader(baseOption, newOptions)
      return createDrawer(
        Vue,
        {
          ...baseOption,
          titleSlotName: 'header',
          visiblePropName: 'model-value',
          closeCbName: 'onClose'
        },
        optionsWithGH
      )
    }
  }
}
