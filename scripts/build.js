import { createRequire } from 'node:module'
import minimist from 'minimist'
import { execaSync } from 'execa'
import { scanEnums } from './const-enum.js'
import { targets as allTargets, fuzzyMatchTarget } from './utils.js'

const require = createRequire(import.meta.url)
const args = minimist(process.argv.slice(2))
const targets = args._
const formats = args.formats || args.f
const devOnly = args.devOnly || args.d
const prodOnly = !devOnly && (args.prodOnly || args.p)
const buildTypes = args.withTypes || args.t
const sourceMap = args.sourcemap || args.s
const isRelease = args.release
const buildAllMatching = args.all || args.a
const commit = execaSync('git', ['rev-parse', 'HEAD']).stdout.slice(0, 7)
run()
function run() {
  const removeCache = scanEnums()
  try {
    const resolvedTargets = targets.length
      ? fuzzyMatchTarget(targets, buildAllMatching)
      : allTargets
    console.log(resolvedTargets)
  } finally {
    removeCache()
  }
}
