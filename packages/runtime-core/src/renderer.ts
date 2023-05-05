import { createAppAPI } from './apiCreateApp'
export function createRenderer() {
  return baseCreateRenderer()
}

function baseCreateRenderer() {
  return {
    createApp: createAppAPI()
  }
}
