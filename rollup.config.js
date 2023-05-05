import { fileURLToPath } from 'node:url'
import path from 'node:path'
import terser from '@rollup/plugin-terser'
import esbuild from 'rollup-plugin-esbuild'
import alias from '@rollup/plugin-alias'
import { entries } from './scripts/aliases.js'
const __dirname = fileURLToPath(new URL('.', import.meta.url))
const packagesDir = path.join(__dirname, 'packages')

export default {
  input: 'packages/runtime-dom/src/index.ts',
  output: {
    file: path.resolve(packagesDir, 'runtime-dom/dist/', 'runtime-dom.js'),
    format: 'es',
    sourcemap: false
  },
  plugins: [
    alias({
      entries
    }),
    terser(),
    esbuild({
      tsconfig: path.resolve(__dirname, 'tsconfig.json'),
      sourceMap: false,
      minify: false
    })
  ]
}
