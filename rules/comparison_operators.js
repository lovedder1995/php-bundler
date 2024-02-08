const matchMultilineString = require('../lib/match_multiline_string.js')
const ignoreStrings = require('../lib/ignore_strings.js')
const arrayCompose = require('../lib/array_compose.js')
const arrayForEach = require('../lib/array_for_each.js')

module.exports = ({ lines, filename }) => {
  let multilineString = {}
  return lines.every((line, index) => {
    multilineString = matchMultilineString({ lines, index, filename, multilineString })
    if (multilineString.error) {
      return false
    }

    if (multilineString.line) {
      return true
    }

    const operatorsReplacements = {
      'is_equal_to ': '=== ',
      'is_not_equal_to ': '!== ',
      'is_less_than ': '< ',
      'is_greater_than ': '> ',
      'is_less_than_or_equal_to ': '<= ',
      'is_greater_than_or_equal_to ': '>= '
    }

    arrayCompose([
      {
        array: Object.keys(operatorsReplacements),
        iteration: operator => {
          lines[index] = arrayCompose([
            {
              line: lines[index],
              transform: line => line.replaceAll(operator, operatorsReplacements[operator])
            },
            ignoreStrings
          ])
        }
      },
      arrayForEach
    ])

    return true
  })
}
