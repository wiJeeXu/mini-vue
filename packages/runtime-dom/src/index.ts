import { createRenderer, CreateAppFunction } from '@vue/runtime-core'
import { isString } from '@vue/shared'
function ensureRenderer() {
  return createRenderer()
}
export const createApp = ((...args: any) => {
  const app = ensureRenderer().createApp(args)
  const { mount } = app
  app.mount = (containerOrSelector: Element | string) => {
    const container = normalizeContainer(containerOrSelector)
    container.innerHTML = ''
    mount(container)
  }
  return app
}) as CreateAppFunction<Element>

function normalizeContainer(container: Element | string): Element {
  if (isString(container)) {
    const res = document.querySelector(container)
    return res
  }
  return container
}
