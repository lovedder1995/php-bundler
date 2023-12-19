const matchClosures = ({ indentationLevel, line, index, filename }) => {
  if (line.includes('function (') || line.includes('if (') || line.trim() === 'else') {
    if (line.startsWith(indentationLevel) && line.endsWith(')')) {
      return { index, line }
    }
  }
}

const missingClosingParentheses = (line) => {
  const openingParenthesis = [...line.matchAll(/\(/g)].length
  const closingParenthesis = [...line.matchAll(/\)/g)].length

  return openingParenthesis - closingParenthesis
}

module.exports = ({ lines, filename }) => {
  const indentation = [
    '                ',
    '            ',
    '        ',
    '    ',
    ''
  ]

  indentation.every(indentationLevel => {
    lines.reduce((closureDeclaration, line, index) => {
      if (!closureDeclaration.line) {
        const matchedClosureDeclaration = matchClosures({ indentationLevel, line, index, filename })

        if (matchedClosureDeclaration) {
          return matchedClosureDeclaration
        }
      } else {
        if (line === '') {
          const lastLine = lines.length - 1 === index
          const topLevelClosure = indentationLevel === ''

          if (topLevelClosure) {
            if (lastLine) {
              lines[closureDeclaration.index] = `${closureDeclaration.line} {`
              lines[index] = '};\n'
            }
          } else {
            const remainingExpressionsInTheScope = !lastLine && lines[index + 1].startsWith(`${indentationLevel} `)
            if (remainingExpressionsInTheScope) {
              return closureDeclaration
            }

            lines[closureDeclaration.index] = `${closureDeclaration.line} {`
            if (missingClosingParentheses(lines[closureDeclaration.index])) {
              lines[index - 1] = `${lines[index - 1]}});`
            } else {
              lines[index - 1] = `${lines[index - 1]}};`
            }
            closureDeclaration = {}
          }
        } else {
          const topDeclaration = !line.startsWith(' ')
          if (topDeclaration) {
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
            lines[index - 2] = '};'
            closureDeclaration = {}

            const matchedClosureDeclaration = matchClosures({ indentationLevel, line, index, filename })

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
