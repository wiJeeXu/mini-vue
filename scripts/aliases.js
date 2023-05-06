import { readdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const dirs = readdirSync(new URL('../packages', import.meta.url))
const entries = {}

const resolveEntryForPkg = p =>
  path.resolve(
    fileURLToPath(import.meta.url),
    `../../packages/${p}/src/index.js`
  )

for (const dir of dirs) {
  const key = `@vue/${dir}`
  entries[key] = resolveEntryForPkg(dir)
}

export { entries }
