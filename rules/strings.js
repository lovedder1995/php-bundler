const matchMultilineString = require('../lib/match_multiline_string.js')
const arrayPipe = require('../lib/array_pipe.js')
const ignoreStrings = require('../lib/ignore_strings.js')

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

    let badStringAssignment = false

    arrayPipe([
      {
        line: lines[index],
        transform: line => {
          if (line.includes("'") || line.includes('"')) {
            badStringAssignment = true
          }

          return line
        }
      },
      ignoreStrings
    ])

    if (badStringAssignment) {
      console.log(`${filename} ${index + 1}`, '- Strings must be assigned using backticks (`).')
      return false
    }

    lines[index] = lines[index].replaceAll('"', '\\"')
    lines[index] = lines[index].replaceAll('`', '"')

    return true
  })
}
