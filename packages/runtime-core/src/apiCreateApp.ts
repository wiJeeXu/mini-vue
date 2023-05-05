import { createVNode } from './vnode'
export interface App<HostElement = any> {
  mount(rootContainer: HostElement | string): void
}

export type CreateAppFunction<HostElement> = () => App<HostElement>

export function createAppAPI<HostElement>() {
  return function createApp(rootComponent: any) {
    let isMounted = false
    const app: App = {
      mount(rootContainer: HostElement) {
        if (!isMounted) {
          createVNode(rootComponent)
          isMounted = true
        }
      }
    }
    return app
  }
}
