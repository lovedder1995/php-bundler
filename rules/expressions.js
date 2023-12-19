module.exports = ({ lines, filename }) => {
  lines.every((line, index) => {
    if (line.endsWith(';')) {
      console.log(`${filename} ${index + 1}`, '- Lines should not end with a semicolon')
      return false
    }

    if (line.trimStart() !== '' && !line.trimStart().startsWith('#')) {
      if (!line.includes('function (') && !line.includes('if (')) {
        if (['{', '(', '[', ','].every(lineEnd => !line.endsWith(lineEnd))) {
          if ([']', ')'].every(nextLineStart => !lines[index + 1].trimStart().startsWith(nextLineStart))) {
            lines[index] = `${line};`
          }
        }
      }
    }

    return true
  })
}
