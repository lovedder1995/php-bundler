const matchFunctionDeclaration = ({ indentationLevel, line, index, filename }) => {
  if (line.startsWith(indentationLevel) && line.endsWith(')') && line.includes('function')) {
    if (!line.includes('function (')) {
      console.log(`${filename} ${index + 1}`, '- There must be a space between the function and the parenthesis')
    } else {
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
    lines.reduce((functionDeclaration, line, index) => {
      if (!functionDeclaration.line) {
        const matchedFunctionDeclaration = matchFunctionDeclaration({ indentationLevel, line, index, filename })

        if (matchedFunctionDeclaration) {
          return matchedFunctionDeclaration
        }
      } else {
        if (line === '') {
          const lastLine = lines.length - 1 === index
          const topLevelFunction = indentationLevel === ''

          if (topLevelFunction) {
            if (lastLine) {
              lines[functionDeclaration.index] = `${functionDeclaration.line} {`
              lines[index] = '};\n'
            }
          } else {
            const remainingExpressionsInTheScope = !lastLine && lines[index + 1].startsWith(`${indentationLevel} `)
            if (remainingExpressionsInTheScope) {
              return functionDeclaration
            }

            lines[functionDeclaration.index] = `${functionDeclaration.line} {`
            if (missingClosingParentheses(lines[functionDeclaration.index])) {
              lines[index - 1] = `${lines[index - 1]}});`
            } else {
              lines[index - 1] = `${lines[index - 1]}};`
            }
            functionDeclaration = {}
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
              console.log(`${filename} ${index + 1}`, '- There must be two blank lines between each top level function')
              return {}
            }
            lines[functionDeclaration.index] = `${functionDeclaration.line} {`
            lines[index - 2] = '};'
            functionDeclaration = {}

            const matchedFunctionDeclaration = matchFunctionDeclaration({ indentationLevel, line, index, filename })

            if (matchedFunctionDeclaration) {
              return matchedFunctionDeclaration
            }
          }
        }
      }

      return functionDeclaration
    }, {})

    return true
  })
}
