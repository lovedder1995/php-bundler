const matchMultilineText = require('php-bundler/lib/match_multiline_text.js')
const arrayCompose = require('php-bundler/lib/array_compose.js')
const ignoreText = require('php-bundler/lib/ignore_text.js')

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

    let badStringAssignment = false

    arrayCompose([
      {
        text: lines[index],
        transform: line => {
          if (line.includes("'") || line.includes('"')) {
            badStringAssignment = true
          }

          return line
        }
      },
      ignoreText
    ])

    if (badStringAssignment) {
      console.log(`${filename} ${index + 1}`, '- Text must be created using backticks (`).')
      return false
    }

    lines[index] = lines[index].replaceAll('"', '\\"')
    lines[index] = lines[index].replaceAll('`', '"')

    return true
  })
}
