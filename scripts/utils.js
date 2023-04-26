import fs from 'node:fs'
import chalk from 'chalk'

export const targets = fs.readdirSync('packages').filter(f => {
  if (!fs.statSync(`packages/${f}`).isDirectory()) {
    return false
  }
  const pkg = require(`../packages/${f}/package.json`)
  if (pkg.private && !pkg.buildOptions) {
    return false
  }
  return true
})

export function fuzzyMatchTarget(partialTargets, includeAllMatching) {
  const matched = []
  partialTargets.forEach(partialTarget => {
    for (let target of targets) {
      if (target.match(partialTarget)) {
        matched.push(target)
        if (!includeAllMatching) {
          break
        }
      }
    }
  })
  if (matched.length) {
    return matched
  } else {
    console.log()
    console.log(
      `  ${chalk.bgRed.white(' ERROR ')} ${chalk.red(
        `Target ${chalk.underline(partialTargets)} not found!`
      )}`
    )
    console.log()
    process.exit(1)
  }
}
