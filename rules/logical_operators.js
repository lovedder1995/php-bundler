module.exports = ({ lines, filename }) => {
  lines.every((line, index) => {
    lines[index] = lines[index].replaceAll(' not ', ' ! ')
    lines[index] = lines[index].replaceAll('(not ', '(! ')

    return true
  })
}
