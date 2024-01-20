module.exports = ({ lines, filename }) => {
  return lines.every((line, index) => {
    const tabs = lines[index].replaceAll('\t', '') !== lines[index]

    if (tabs) {
      console.log(`${filename} ${index + 1}`, '- Tab characters should not be used')
      return false
    }

    if (lines[index].trimStart().includes('  ')) {
      console.log(`${filename} ${index + 1}`, '- There should not be two spaces in a row')
      return false
    }

    if (lines[index].length > lines[index].trimEnd().length) {
      console.log(`${filename} ${index + 1}`, '- Lines must not end with spaces')
      return false
    }

    return true
  })
}
