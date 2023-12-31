module.exports = ({ lines, filename }) => {
  lines.every((line, index) => {
    if (line === '') {
      const lineBefore = lines[index - 1]
      const lineAfter = lines[index + 1]
      const lastLine = lines.length - 1 === index

      if (!lastLine && lineBefore !== undefined) {
        const validBlankLine = [
          '}',
          ']'
        ].filter(lineStart => lineBefore.startsWith(lineStart))[0]

        if (!validBlankLine) {
          if (lineAfter) {
            if (['[', '{'].filter(lineStart => lineAfter.endsWith(lineStart))[0]) {
              return true
            }
          }
          console.log(index + 2, '(output file) - Invalid blank line ')
        }
      }
    }

    return true
  })
}
