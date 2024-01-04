module.exports = ({ lines, filename }) => {
  lines.every((line, index) => {
    if (line.trimStart().startsWith('//') || line.trimStart().startsWith('/*')) {
      console.log(`${filename} ${index + 1}`, '- Comments should only be written with a octothrope')
      return false
    }

    if (line.trimStart().startsWith('#  ') || (line.trimStart().startsWith('#') && !line.trimStart().startsWith('# '))) {
      console.log(`${filename} ${index + 1}`, '- There must be one space between the octothrope and the comment.')
      return false
    }

    return true
  })
}
