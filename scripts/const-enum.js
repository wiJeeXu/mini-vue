import { execaSync } from 'execa'
import path from 'node:path'
import {
  readFileSync,
  existsSync,
  mkdirSync,
  writeFileSync,
  rmSync
} from 'node:fs'
import { parse } from '@babel/parser'
const ENUM_CACHE_PATH = 'temp/enum.json'
export function scanEnums() {
  const enumData = {
    ranges: {},
    defines: {},
    ids: []
  }
  const { stdout } = execaSync('git', ['grep', `export const enum`])
  const files = [...new Set(stdout.split('\n').map(line => line.split(':')[0]))]
  for (const relativeFile of files) {
    const file = path.resolve(process.cwd(), relativeFile)
    const content = readFileSync(file, 'utf-8')
    const ast = parse(content, {
      plugins: ['typescript'],
      sourceType: 'module'
    })
    for (let node of ast.program.body) {
      if (
        node.type === 'ExportNamedDeclaration' &&
        node.declaration &&
        node.declaration.type === 'TSEnumDeclaration'
      ) {
        if (file in enumData.ranges) {
          enumData.ranges[file].push([node.start, node.end])
        } else {
          enumData.ranges[files] = [[node.start, node.end]]
        }

        const decl = node.declaration
        let lastInitialized
        for (let i = 0; i < decl.members.length; i++) {
          const e = decl.members[i]
          const id = decl.id.name
          if (!enumData.ids.includes(id)) {
            enumData.ids.push(id)
          }
          const key = e.id.type === 'Identifier' ? e.id.name : e.id.value
          const fullKey = `${id}.${key}`
          const saveValue = value => {
            if (fullKey in enumData.defines) {
              throw new Error(`name conflict for enum ${id} in ${file}`)
            }
            enumData.defines[fullKey] = JSON.stringify(value)
          }
          const init = e.initializer
          if (init) {
            let value
            if (
              init.type === 'StringLiteral' ||
              init.type === 'NumericLiteral'
            ) {
              value = init.value
            }

            // e.g. 1 << 2
            if (init.type === 'BinaryExpression') {
              const resolveValue = node => {
                if (
                  node.type === 'NumericLiteral' ||
                  node.type === 'StringLiteral'
                ) {
                  return node.value
                } else if (node.type === 'MemberExpression') {
                  const exp = content.slice(node.start, node.end)
                  if (!(exp in enumData.defines)) {
                    throw new Error(
                      `unhandled enum initialization expression ${exp} in ${file}`
                    )
                  }
                  return enumData.defines[exp]
                } else {
                  throw new Error(
                    `unhandled BinaryExpression operand type ${node.type} in ${file}`
                  )
                }
              }
              const exp = `${resolveValue(init.left)}${
                init.operator
              }${resolveValue(init.right)}`
              value = evaluate(exp)
            }

            if (init.type === 'UnaryExpression') {
              if (
                init.argument.type === 'StringLiteral' ||
                init.argument.type === 'NumericLiteral'
              ) {
                const exp = `${init.operator}${init.argument.value}`
                value = evaluate(exp)
              } else {
                throw new Error(
                  `unhandled UnaryExpression argument type ${init.argument.type} in ${file}`
                )
              }
            }

            if (value === undefined) {
              throw new Error(
                `unhandled initializer type ${init.type} for ${fullKey} in ${file}`
              )
            }
            saveValue(value)
            lastInitialized = value
          } else {
            if (lastInitialized === undefined) {
              // first initialized
              saveValue((lastInitialized = 0))
            } else if (typeof lastInitialized === 'number') {
              saveValue(++lastInitialized)
            } else {
              // should not happen
              throw new Error(`wrong enum initialization sequence in ${file}`)
            }
          }
        }
      }
    }
  }
  if (!existsSync('temp')) mkdirSync('temp')
  writeFileSync(ENUM_CACHE_PATH, JSON.stringify(enumData))

  return () => {
    rmSync(ENUM_CACHE_PATH, { force: true })
  }
}
