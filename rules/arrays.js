module.exports = ({ lines, filename }) => {
  const indentation = [
    '                ',
    '            ',
    '        ',
    '    ',
    ''
  ]

  indentation.every(indentationLevel => {
    lines.reduce((arrayDeclaration, line, index) => {
      const currentIndentationLevel = line.startsWith(indentationLevel) && !line.startsWith(`${indentationLevel} `)

      if (!arrayDeclaration.line && currentIndentationLevel && (line.endsWith('[') || line.endsWith('('))) {
        return { line, index }
      }

      if (currentIndentationLevel && arrayDeclaration.line) {
        return {}
      }

      const arrayItemsScope = line.startsWith(`${indentationLevel}    `) && !line.startsWith(`${indentationLevel}     `)

      if (arrayItemsScope && arrayDeclaration.line) {
        if (['{', '(', '['].every(lineEnd => !line.endsWith(lineEnd))) {
          if ([']', ')'].every(nextLineStart => !lines[index + 1].trimStart().startsWith(nextLineStart))) {
            if (line.endsWith(';')) {
              lines[index] = line.slice(0, -1)
            }
            lines[index] = `${lines[index]},`
          }
        }
      }

      return arrayDeclaration
    }, {})

    return true
  })
}
