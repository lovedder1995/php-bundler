const matchMultilineString = require('../lib/match_multiline_string.js')

module.exports = ({ lines, filename }) => {
  let multilineString = {}
  lines.every((line, index) => {
    multilineString = matchMultilineString({lines, index, filename, multilineString})
    if (multilineString.line) {
      return true
    }

    lines[index] = lines[index].replaceAll('is_equal_to ', '=== ')
    lines[index] = lines[index].replaceAll('is_not_equal_to ', '!== ')
    lines[index] = lines[index].replaceAll('is_less_than ', '< ')
    lines[index] = lines[index].replaceAll('is_greater_than ', '> ')
    lines[index] = lines[index].replaceAll('is_less_than_or_equal_to ', '<= ')
    lines[index] = lines[index].replaceAll('is_greater_than_or_equal_to ', '>= ')

    return true
  })
}
