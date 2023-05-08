import { createRenderer } from '@vue/runtime-core'
import { isString } from '@vue/shared'

const rendererOptions = {}
let renderer
function ensureRenderer() {
  return renderer || (renderer = createRenderer(rendererOptions))
}
export const createApp = (...args) => {
  const app = ensureRenderer().createApp()
  const { mount } = app
  app.mount = containerOrSelector => {
    const container = normalizeContainer(containerOrSelector)
    container.innerHTML = ''
    mount(container)
  }

  return app
}

function normalizeContainer(container) {
  if (isString(container)) {
    const res = document.querySelector(container)
    return res
  }
  return container
}
