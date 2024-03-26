const matchMultilineText = require('../lib/match_multiline_text.js')

module.exports = ({ lines, filename }) => {
  let multilineString = {}
  return lines.every((line, index) => {
    multilineString = matchMultilineText({ lines, index, filename, multilineString })
    if (multilineString.error) {
      return false
    }

    if (multilineString.line) {
      return true
    }

    if (lines[index] === '') {
      const lineBefore = lines[index - 1]
      const lineAfter = lines[index + 1]
      const lastLine = lines.length - 1 === index

      if (!lastLine && lineBefore !== undefined) {
        if (lineBefore.startsWith(' ') && lineBefore.trimStart().startsWith('}')) {
          console.log(`${filename} ${index + 1}`, '- Invalid blank line')
          return false
        }
        const validBeforeLineStart = [
          '}',
          ']'
        ].find(lineStart => lineBefore.startsWith(lineStart))

        if (!validBeforeLineStart) {
          if (['[', '{', '<<<STRING'].find(lineStart => lineAfter.endsWith(lineStart))) {
            return true
          }
          console.log(`${filename} ${index + 1}`, '- Invalid blank line')
          return false
        }
      }
    }

    return true
  })
}
