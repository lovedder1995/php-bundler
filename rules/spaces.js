module.exports = ({ lines, filename }) => {
  lines.every((line, index) => {
    if (line.trimStart().includes('  ')) {
      console.log(`${filename} ${index + 1}`, '- There should not be two spaces in a row')
      return false
    }

    if (line.length > line.trimEnd().length) {
      console.log(`${filename} ${index + 1}`, '- Lines must not end with spaces')
      return false
    }

    return true
  })
}
