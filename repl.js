/*eslint no-console: "off"*/

import * as ReadLine from 'readline'
const Chalk = require('chalk')
import * as ColorMath from './src'
const {LessEvaluator, CoreEvaluator} = ColorMath.Evaluators

const lessEval = new LessEvaluator()

const rl = ReadLine.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false,
})

rl.setPrompt('> ')
rl.prompt()

rl
  .on('line', (line) => {
    const flags = {withAst: false, less: false}
    line = parseFlags(line, flags)

    if (line) {
      const res = ColorMath.evaluate(line, {
        evaluator: flags.less ? lessEval : CoreEvaluator.instance,
        withAst: flags.withAst,
      })

      if (res.error != null) {
        console.log(Chalk.red(`\n${res.error}\n`))
      } else if (flags.withAst) {
        console.log(`\n${res.astStr}\n`)
      } else {
        console.log(`= ${res.resultStr}\n`)
      }
    }

    rl.prompt()
  })
  .on('close', () => {
    process.exit(0)
  })

function parseFlags(line, dict) {
  let i = 0
  const keys = Object.keys(dict)

  while (i < keys.length) {
    const key = keys[i]
    const lineNext = line.replace(new RegExp(`^\\s*${key}\\s+`, 'i'), '')

    if (lineNext !== line) {
      line = lineNext
      dict[key] = true
      keys.splice(i, 1)
      i = 0
    } else {i++}
  }

  return line
}
