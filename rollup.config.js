import { fileURLToPath } from 'node:url'
import path from 'node:path'
import terser from '@rollup/plugin-terser'
import esbuild from 'rollup-plugin-esbuild'
import alias from '@rollup/plugin-alias'
import { entries } from './scripts/aliases.js'
const __dirname = fileURLToPath(new URL('.', import.meta.url))

export default {
  input: 'packages/runtime-dom/src/index.js',
  output: {
    file: path.resolve(__dirname, 'vue', 'vue.js'),
    format: 'es',
    sourcemap: false
  },
  plugins: [
    alias({
      entries
    }),
    terser(),
    esbuild({
      sourceMap: false,
      minify: false
    })
  ]
}
