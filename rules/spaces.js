module.exports = ({ lines, filename }) => {
  lines.every((line, index) => {
    if (line.length > line.trimEnd().length) {
      console.log(`${filename} ${index + 1}`, '- Lines must not end with spaces')
      return false
    }

    return true
  })
}
