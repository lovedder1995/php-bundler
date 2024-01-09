module.exports = ({ lines, filename }) => {
  const indentation = [
    '            ',
    '        ',
    '    ',
    ''
  ]

  indentation.every(indentationLevel => {
    lines.reduce((arrayDeclaration, line, index) => {
      const currentIndentationLevel = lines[index].startsWith(indentationLevel) && !lines[index].startsWith(`${indentationLevel} `)

      if (!arrayDeclaration.line && currentIndentationLevel && (lines[index].endsWith('[') || lines[index].endsWith('('))) {
        const linesBefore = [
          lines[index - 1],
          lines[index - 2]
        ]

        if (linesBefore[0] !== undefined) {
          if (!lines[index].startsWith(' ')) {
            if (linesBefore[0] !== '' || linesBefore[1] === '') {
              console.log(`${filename} ${index + 1}`, '- There must be one blank line before each top level array')
              return {}
            }
          }
        }
        return { line: lines[index], index }
      }

      if (currentIndentationLevel && arrayDeclaration.line) {
        const linesAfter = [
          lines[index + 1],
          lines[index + 2]
        ]

        if (!lines[index].startsWith(' ') && (linesAfter[0] !== '' || linesAfter[1] === '')) {
          console.log(lines[index], `${filename} ${index + 1}`, '- There must be one blank line after each top level array')
          return {}
        }

        return {}
      }

      const arrayItemsScope = lines[index].startsWith(`${indentationLevel}    `) && !lines[index].startsWith(`${indentationLevel}     `)

      if (arrayItemsScope && arrayDeclaration.line) {
        if (['{', '('].every(lineEnd => !lines[index].endsWith(lineEnd))) {
          if (!lines[index].trimStart().startsWith('`')) {
            let item = lines[index].trimStart()
            if (!item.startsWith(']')) {
              if (item.includes(' : ')) {
                item = item.split(' : ')[0]
                if (!lines[index].trimStart().startsWith('}')) {
                  lines[index] = lines[index].replace(item, `"${item}"`)
                }
              }

              const startsWithANumber = item.trimStart().match(/^\d/)
              if (!item.includes(' : ') && !lines[index].trimStart().startsWith('}') && !startsWithANumber) {
                lines[index] = lines[index].replace(item, `"${item}"`)
              }
            }
          }

          if ([']', ')'].every(nextLineStart => !lines[index + 1].trimStart().startsWith(nextLineStart))) {
            if (!lines[index].endsWith('[')) {
              lines[index] = `${lines[index]},`
            }
          }
          lines[index] = lines[index].replace(' : ', ' => ')
        }
      }

      return arrayDeclaration
    }, {})

    return true
  })
}
