import { createVNode } from './vnode'
export function createAppAPI(render) {
  return function createApp(rootComponent) {
    // 首次mount标记
    let isMounted = false
    const app = {
      mount(rootContainer) {
        if (!isMounted) {
          const vnode = createVNode(rootComponent)
          isMounted = true
        }
      }
    }
    return app
  }
}
