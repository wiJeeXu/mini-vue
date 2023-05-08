import { createAppAPI } from './apiCreateApp'
export function createRenderer(options) {
  return baseCreateRenderer(options)
}

function baseCreateRenderer(options) {
  const render = () => {}
  return {
    createApp: createAppAPI(render)
  }
}
