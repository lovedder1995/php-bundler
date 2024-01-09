const matchMultilineString = require('../lib/match_multiline_string.js')

module.exports = ({ lines, filename }) => {
  let multilineString = {}
  lines.every((line, index) => {
    multilineString = matchMultilineString({ lines, index, filename, multilineString })
    if (multilineString.line) {
      return true
    }

    if (lines[index].trimStart().startsWith('if ')) {
      lines[index] = `${lines[index].replace('if ', 'if (')})`
    }

    return true
  })
}
