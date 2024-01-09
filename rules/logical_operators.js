const matchMultilineString = require('../lib/match_multiline_string.js')

module.exports = ({ lines, filename }) => {
  let multilineString = {}
  lines.every((line, index) => {
    multilineString = matchMultilineString({lines, index, filename, multilineString})
    if (multilineString.line) {
      return true
    }

    lines[index] = lines[index].replaceAll(' not ', ' ! ')
    lines[index] = lines[index].replaceAll('(not ', '(! ')

    return true
  })
}
