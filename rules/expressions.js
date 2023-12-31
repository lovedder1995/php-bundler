module.exports = ({ lines, filename }) => {
  let multilineString = {}
  lines.every((line, index) => {
    if (line.endsWith('`')) {
      if (multilineString.line && line.trimStart() === '`') {
        const linesAfter = [
          lines[index + 1],
          lines[index + 2]
        ]

        const indentation = lines[multilineString.index].length - lines[multilineString.index].trimStart().length

        if (indentation === 0 && (linesAfter[0] !== '' || linesAfter[1] === '')) {
          console.log(`${filename} ${index + 1}`, '- There must be one blank line between each top level multiline string')
          return {}
        }
        lines[index] = `${' '.repeat(indentation)}STRING;`
        multilineString = {}
        return true
      }

      const multilineStringDeclaration = ([...line.matchAll(/`/g)].length % 2) !== 0
      if (multilineStringDeclaration) {
        const linesBefore = [
          lines[index - 1],
          lines[index - 2]
        ]

        if (linesBefore[0] !== undefined) {
          if (!line.startsWith(' ')) {
            if (linesBefore[0] !== '' || linesBefore[1] === '') {
              console.log(`${filename} ${index + 1}`, '- There must be one blank line between each top level multiline string')
              return {}
            }
          }
        }

        lines[index] = `${line.slice(0, -1)}<<<STRING`
        multilineString = { line, index }
        return true
      }
    }

    if (line.endsWith(';')) {
      console.log(`${filename} ${index + 1}`, '- Lines should not end with a semicolon')
      return false
    }

    if (!multilineString.line && line !== '' && !line.trimStart().startsWith('#')) {
      if (!line.includes('function (') && !line.includes('if (')) {
        if (['{', '(', '[', ','].every(lineEnd => !line.endsWith(lineEnd))) {
          const nextLineExists = index + 1 < lines.length
          const nextLine = lines[index + 1]
          if (nextLineExists && [']', ')'].every(lineStart => !nextLine.trimStart().startsWith(lineStart))) {
            lines[index] = `${line};`
          }
        }
      }
    }

    return true
  })
}
