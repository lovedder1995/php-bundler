const matchMultilineString = require('../lib/match_multiline_string.js')

module.exports = ({ lines, filename }) => {
  const clutter = {
    echo: 'print',
    sizeof: 'array_length',
    count: 'array_length'
  }

  const aliases = {
    array_length: 'count'
  }

  let multilineString = {}
  return lines.every((line, index) => {
    multilineString = matchMultilineString({ lines, index, filename, multilineString })
    if (multilineString.error) {
      return false
    }

    if (multilineString.line) {
      return true
    }
    Object.keys(clutter).every(functionToAvoid => {
      if (
        lines[index].trimStart() === functionToAvoid ||
        lines[index].trimStart().startsWith(`${functionToAvoid}(`) ||
        lines[index].includes(` ${functionToAvoid}(`) ||
        lines[index].includes(`[${functionToAvoid}(`) ||
        lines[index].includes(`(${functionToAvoid}(`)
      ) {
        console.log(`${filename} ${index + 1}`, `- Use ${clutter[functionToAvoid]}() insted of ${functionToAvoid}()`)
        return false
      }

      return true
    })

    Object.keys(aliases).every(functionAlias => {
      lines[index] = lines[index].replaceAll(`[${functionAlias}(`, `[${aliases[functionAlias]}(`)
      lines[index] = lines[index].replaceAll(`(${functionAlias}(`, `(${aliases[functionAlias]}(`)
      lines[index] = lines[index].replaceAll(` ${functionAlias}(`, ` ${aliases[functionAlias]}(`)
      if (lines[index].trimStart().startsWith(`${functionAlias}(`)) {
        lines[index] = lines[index].replace(`${functionAlias}(`, `${aliases[functionAlias]}(`)
      }
      if (lines[index].endsWith(` ${functionAlias}`)) {
        lines[index] = lines[index].replaceAll(` ${functionAlias}`, ` ${aliases[functionAlias]}`)
      }

      return true
    })

    return true
  })
}
