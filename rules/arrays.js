module.exports = ({ lines, filename }) => {
  const indentation = [
    '            ',
    '        ',
    '    ',
    ''
  ]

  indentation.every(indentationLevel => {
    lines.reduce((arrayDeclaration, line, index) => {
      const currentIndentationLevel = line.startsWith(indentationLevel) && !line.startsWith(`${indentationLevel} `)

      if (!arrayDeclaration.line && currentIndentationLevel && (line.endsWith('[') || line.endsWith('('))) {
        const linesBefore = [
          lines[index - 1],
          lines[index - 2]
        ]

        if (linesBefore[0] !== undefined) {
          if (!line.startsWith(' ')) {
            if (linesBefore[0] !== '' || linesBefore[1] === '') {
              console.log(`${filename} ${index + 1}`, '- There must be one blank line before each top level array')
              return {}
            }
          }
        }
        return { line, index }
      }

      if (currentIndentationLevel && arrayDeclaration.line) {
        const linesAfter = [
          lines[index + 1],
          lines[index + 2]
        ]

        if (!line.startsWith(' ') && (linesAfter[0] !== '' || linesAfter[1] === '')) {
          console.log(line, `${filename} ${index + 1}`, '- There must be one blank line after each top level array')
          return {}
        }

        return {}
      }

      const arrayItemsScope = line.startsWith(`${indentationLevel}    `) && !line.startsWith(`${indentationLevel}     `)

      if (arrayItemsScope && arrayDeclaration.line) {
        if (['{', '('].every(lineEnd => !line.endsWith(lineEnd))) {
          if (!line.trimStart().startsWith('`')) {
            let item = line.trimStart()
            if (!item.startsWith(']')) {
              if (item.includes(' : ')) {
                item = item.split(' : ')[0]
                if (!line.trimStart().startsWith('}')) {
                  lines[index] = line.replace(item, `"${item}"`)
                }
              }

              const startsWithANumber = item.trimStart().match(/^\d/)
              if (!item.includes(' : ') && !line.trimStart().startsWith('}') && !startsWithANumber) {
                lines[index] = line.replace(item, `"${item}"`)
              }
            }
          }

          if ([']', ')'].every(nextLineStart => !lines[index + 1].trimStart().startsWith(nextLineStart))) {
            if (!line.endsWith('[')) {
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
