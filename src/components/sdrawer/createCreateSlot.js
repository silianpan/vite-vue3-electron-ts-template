export function createDrawerSlot(createElement, slotVnMap, close) {
  return (options, slot = 'default') => {
    const slotElement = createElement(options.template, {
      ...options.props,
      onClose: close
    })
    slotVnMap[slot] = slotElement
    return slotElement
  }
}
export function createModalSlot(createElement, slotVnMap, confirmLoading, close, ok) {
  return (options, slot = 'default') => {
    const slotElement = createElement(options.template, {
      ...options.props,
      confirmLoading,
      onClose: close,
      onOk: ok
    })
    slotVnMap[slot] = slotElement
    return slotElement
  }
}
