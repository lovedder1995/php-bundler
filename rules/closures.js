const matchClosures = ({ indentationLevel, lines, line, index, filename }) => {
  const currentIndentationLevel = line.startsWith(indentationLevel) && !line.startsWith(`${indentationLevel} `)

  if (currentIndentationLevel && line.endsWith('{')) {
    console.log(`${filename} ${index + 1}`, '- Lines should not end with a opening curly bracket')
    return false
  }

  if (line.includes('function ()') || line.includes('function ( )')) {
    console.log(`${filename} ${index + 1}`, '- Functions without arguments must not have parentheses.')
    return false
  }

  if (line.includes('use ()') || line.includes('use ( )')) {
    console.log(`${filename} ${index + 1}`, '- The keyword "use" in functions must not be used without arguments.')
    return false
  }

  if (currentIndentationLevel && line.includes('function use')) {
    lines[index] = lines[index].replace('function use', 'function () use')
  }

  if (currentIndentationLevel && line.endsWith('function')) {
    lines[index] = `${line.slice(0, -8)}function ()`
  }

  if (lines[index].includes('function (') || lines[index].includes('if (')) {
    if (lines[index].startsWith(indentationLevel) && lines[index].endsWith(')')) {
      return { index, line: lines[index] }
    }
  }
}

module.exports = ({ lines, filename }) => {
  lines.every((line, index) => {
    if (line.includes('function(')) {
      console.log(`${filename} ${index + 1}`, '- There must be one space between function and (')
      return false
    }

    if (line.includes('if(')) {
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
    lines.reduce((closureDeclaration, line, index) => {
      if (!closureDeclaration.line) {
        const matchedClosureDeclaration = matchClosures({ indentationLevel, lines, line, index, filename })

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
        if (line === '') {
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
          const topLevelDeclaration = !line.startsWith(' ')
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

            const matchedClosureDeclaration = matchClosures({ indentationLevel, lines, line, index, filename })

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
