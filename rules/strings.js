module.exports = ({ lines, filename }) => {
  lines.every((line, index) => {
    lines[index] = lines[index].replaceAll('`', '"')

    return true
  })
}
