import { createApp, h, ref, onMounted } from 'vue'
import { createModalSlot } from './createCreateSlot'
import { getSlotPayload } from './getSlotPayload'
import { locationMatcher } from './locationMatcher'
import { setGlobalHeader } from './setGlobalHeader'
import { modifyOptions } from './modifyOptions'
import { ElConfigProvider } from 'element-plus'
// import pluginApi from '@@/plugins'
/**
 * modalProps 就是组件库的 modal 支持的props
 * title、content、footer 都是对象，其中 template 属性代表组件，其他属性同 vue 的原生属性 https://cn.vuejs.org/v2/guide/render-function.html#%E6%B7%B1%E5%85%A5%E6%95%B0%E6%8D%AE%E5%AF%B9%E8%B1%A1
 */
// 创建弹框的主方法
export function createModal(
  app,
  {
    component: Modal,
    titleSlotName = 'title',
    footerSlotName = 'footer',
    visiblePropName = 'visible',
    btnLoadingPropName = 'confirmLoading',
    cancelCbName = 'cancel',
    okCbName = 'ok',
    router,
    store,
    locale
  },
  options
) {
  const {
    title,
    content,
    footer,
    modalProps,
    beforeClose,
    afterClose,
    onOk,
    payloadSlot,
    onClick,
    stopPropagation,
    hideBottom
  } = options

  const el = document.createElement('div')

  const firstRender = ref(true)
  const visible = ref(false)
  const confirmLoading = ref(false)
  const slotVnMap = ref({})

  const handleClose = async (payload) => {
    if (!visible.value) return
    beforeClose && (await beforeClose(payload))
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

  const handleOk = async (payload) => {
    const slotPayload = await getSlotPayload(slotVnMap.value, payloadSlot)
    confirmLoading.value = true
    const res = onOk && (await onOk({ payload, slotPayload }))
    confirmLoading.value = false
    if (res !== false) {
      await handleClose({ payload, slotPayload })
    }
  }

  const handleNativeClick = (event) => {
    if (stopPropagation) {
      event.stopPropagation()
    }
    onClick && onClick(event)
  }

  const createSlot = createModalSlot(h, slotVnMap.value, confirmLoading.value, handleClose, handleOk)

  const children = {}

  if (content && content.template) {
    // children.push(createSlot(content))
    children.default = () => createSlot(content)
  }

  if (title && title.template) {
    // children.push(createSlot(title, titleSlotName))
    children[titleSlotName] = () => createSlot(title, titleSlotName)
    modalProps.title && delete modalProps.title
  }

  if (footer && footer.template) {
    // children.push(createSlot(footer, footerSlotName))
    children[footer] = () => createSlot(footer, footerSlotName)
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
        confirmLoading,
        handleClose,
        handleOk,
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
              Modal,
              {
                modalClass: hideBottom === true ? null : 'sdrawer-common-dialog',
                ...modalProps,
                [btnLoadingPropName]: confirmLoading.value,
                [visiblePropName]: visible.value,
                [cancelCbName]: handleClose,
                [okCbName]: handleOk,
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

// 创建 antd modal 的扩展方法
export const createAntdModal = {
  install(Vue, originBaseOption) {
    Vue.config.globalProperties.$createAntdModal = function (options, argObj, argLocation) {
      const { location, baseOption } = modifyOptions(originBaseOption, argObj, argLocation)
      const newOptions = locationMatcher.call(this, location, baseOption, options)
      const optionsWithGH = setGlobalHeader(baseOption, newOptions)
      return createModal(
        Vue,
        {
          ...baseOption,
          titleSlotName: 'title',
          footerSlotName: 'footer',
          visiblePropName: 'visible',
          btnLoadingPropName: 'confirmLoading',
          cancelCbName: 'cancel',
          okCbName: 'ok'
        },
        optionsWithGH
      )
    }
  }
}
// 创建 iview modal 的扩展方法
export const createViewModal = {
  install(Vue, originBaseOption) {
    Vue.config.globalProperties.$createViewModal = function (options, argObj, argLocation) {
      const { location, baseOption } = modifyOptions(originBaseOption, argObj, argLocation)
      const newOptions = locationMatcher.call(this, location, baseOption, options)
      const optionsWithGH = setGlobalHeader(baseOption, newOptions)
      return createModal(
        Vue,
        {
          ...baseOption,
          titleSlotName: 'header',
          footerSlotName: 'footer',
          visiblePropName: 'value',
          btnLoadingPropName: 'loading',
          cancelCbName: 'on-cancel',
          okCbName: 'on-ok'
        },
        optionsWithGH
      )
    }
  }
}
// 创建 ele modal 的扩展方法
export const createEleModal = {
  install(Vue, originBaseOption) {
    Vue.config.globalProperties.$createEleModal = function (options, argObj, argLocation) {
      const { location, baseOption } = modifyOptions(originBaseOption, argObj, argLocation)
      const newOptions = locationMatcher.call(this, location, baseOption, options)
      const optionsWithGH = setGlobalHeader(baseOption, newOptions)
      return createModal(
        Vue,
        {
          ...baseOption,
          titleSlotName: 'header',
          footerSlotName: 'footer',
          visiblePropName: 'model-value',
          btnLoadingPropName: 'loading',
          cancelCbName: 'onClose',
          okCbName: 'onOk'
        },
        optionsWithGH
      )
    }
  }
}
