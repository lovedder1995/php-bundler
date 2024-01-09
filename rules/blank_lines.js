const matchMultilineString = require('../lib/match_multiline_string.js')

module.exports = ({ lines, filename }) => {
  let multilineString = {}
  lines.every((line, index) => {
    multilineString = matchMultilineString({lines, index, filename, multilineString})
    if (multilineString.line) {
      return true
    }

    if (lines[index] === '') {
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
            if (['[', '{', '<<<STRING'].filter(lineStart => lineAfter.endsWith(lineStart))[0]) {
              return true
            }
          }
          console.log(`${filename} ${index + 1}`, '- Invalid blank line ')
          return false
        }
      }
    }

    return true
  })
}
