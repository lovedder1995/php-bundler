module.exports = ({ lines, filename }) => {
  lines.every((line, index) => {
    if (line.trimStart().startsWith('if ')) {
      lines[index] = `${lines[index].replace('if ', 'if (')})`
    }

    return true
  })
}
