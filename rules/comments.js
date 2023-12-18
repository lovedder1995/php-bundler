module.exports = ({ lines, filename }) => {
  lines.every((line, index) => {
    if (line.includes('#')) {
      if (!line.trimStart().startsWith('#')) {
        console.log(`${filename} ${index + 1}`, '- Comments should be on their own line')
        return false
      }

      if (line.includes('#  ') || (line.includes('#') && !line.includes('# '))) {
        console.log(`${filename} ${index + 1}`, '- There must be one space between the octothrope and the comment.')
        return false
      }
    }

    return true
  })
}
