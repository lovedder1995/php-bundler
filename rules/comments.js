const matchMultilineString = require('../lib/match_multiline_string.js')

module.exports = ({ lines, filename }) => {
  let multilineString = {}
  lines.every((line, index) => {
    multilineString = matchMultilineString({ lines, index, filename, multilineString })
    if (multilineString.line) {
      return true
    }

    if (lines[index].trimStart().startsWith('//') || lines[index].trimStart().startsWith('/*')) {
      console.log(`${filename} ${index + 1}`, '- Comments should only be written with a octothrope')
      return false
    }

    if (lines[index].trimStart().startsWith('#  ') || (lines[index].trimStart().startsWith('#') && !lines[index].trimStart().startsWith('# '))) {
      console.log(`${filename} ${index + 1}`, '- There must be one space between the octothrope and the comment.')
      return false
    }

    return true
  })
}
