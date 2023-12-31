const matchMultilineString = require('../lib/match_multiline_string.js')

const matchClosures = ({ indentationLevel, lines, index, filename }) => {
  const currentIndentationLevel = lines[index].startsWith(indentationLevel) && !lines[index].startsWith(`${indentationLevel} `)

  if (currentIndentationLevel && lines[index].endsWith('{')) {
    console.log(`${filename} ${index + 1}`, '- Lines should not end with a opening curly bracket')
    return false
  }

  if (lines[index].includes('function ()') || lines[index].includes('function ( )')) {
    console.log(`${filename} ${index + 1}`, '- Functions without arguments must not have parentheses.')
    return false
  }

  if (lines[index].includes('use ()') || lines[index].includes('use ( )')) {
    console.log(`${filename} ${index + 1}`, '- The keyword "use" in functions must not be used without arguments.')
    return false
  }

  if (currentIndentationLevel && lines[index].includes('function use')) {
    lines[index] = lines[index].replace('function use', 'function () use')
  }

  if (currentIndentationLevel && lines[index].endsWith('function')) {
    lines[index] = `${lines[index].slice(0, -8)}function ()`
  }

  if (lines[index].includes('function (') || lines[index].includes('if (')) {
    if (lines[index].startsWith(indentationLevel) && lines[index].endsWith(')')) {
      return { index, line: lines[index] }
    }
  }
}

module.exports = ({ lines, filename }) => {
  let multilineString = {}
  lines.every((line, index) => {
    multilineString = matchMultilineString({ lines, index, filename, multilineString })
    if (multilineString.line) {
      return true
    }

    if (lines[index].includes('function(')) {
      console.log(`${filename} ${index + 1}`, '- There must be one space between function and (')
      return false
    }

    if (lines[index].includes('if(')) {
      console.log(`${filename} ${index + 1}`, '- There must be one space between if and (')
      return false
    }

    return true
  })

  const indentation = [
    '            ',
    '        ',
    '    ',
    ''
  ]

  indentation.every(indentationLevel => {
    let multilineString = {}
    lines.reduce((closureDeclaration, line, index) => {
      multilineString = matchMultilineString({ lines, index, filename, multilineString })
      if (multilineString.line) {
        return closureDeclaration
      }

      if (!closureDeclaration.line) {
        const matchedClosureDeclaration = matchClosures({ indentationLevel, lines, index, filename })

        if (matchedClosureDeclaration) {
          const linesBefore = [
            lines[index - 1],
            lines[index - 2]
          ]

          if (linesBefore[0] !== undefined) {
            if ((!linesBefore[0].trimStart().startsWith('}') && linesBefore[0] !== '') || linesBefore[1] === '') {
              console.log(`${filename} ${index + 1}`, '- There must be one blank line between each closure')
              return {}
            }
          }

          return matchedClosureDeclaration
        }
      } else {
        if (lines[index] === '') {
          const lastLine = lines.length - 1 === index
          const topLevelClosure = indentationLevel === ''

          if (topLevelClosure) {
            if (lastLine) {
              lines[closureDeclaration.index] = `${closureDeclaration.line} {`
              lines[index] = '}'
              lines[index + 1] = ''
            }
          } else {
            const remainingExpressionsInTheScope = !lastLine && lines[index + 1].startsWith(`${indentationLevel} `)
            if (remainingExpressionsInTheScope) {
              return closureDeclaration
            }

            lines[closureDeclaration.index] = `${closureDeclaration.line} {`
            lines[index] = `${indentationLevel}}`
            closureDeclaration = {}
          }
        } else {
          const topLevelDeclaration = !lines[index].startsWith(' ')
          if (topLevelDeclaration) {
            const linesBefore = [
              lines[index - 1],
              lines[index - 2],
              lines[index - 3]
            ]

            const twoBlankLines = linesBefore[0] === '' && linesBefore[1] === '' && linesBefore[2] !== ''

            if (!twoBlankLines) {
              console.log(`${filename} ${index + 1}`, '- There must be two blank lines between each top level closure')
              return {}
            }

            lines[closureDeclaration.index] = `${closureDeclaration.line} {`
            lines[index - 2] = '}'
            closureDeclaration = {}

            const matchedClosureDeclaration = matchClosures({ indentationLevel, lines, index, filename })

            if (matchedClosureDeclaration) {
              return matchedClosureDeclaration
            }
          }
        }
      }

      return closureDeclaration
    }, {})

    return true
  })
}
