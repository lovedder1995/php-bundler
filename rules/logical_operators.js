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

    lines[index] = lines[index].replaceAll(' not ', ' ! ')
    lines[index] = lines[index].replaceAll('(not ', '(! ')

    return true
  })
}
