module.exports = ({ lines, filename }) => {
  const noBlankLineEnd = lines.slice(-1)[0] !== ''
  if (noBlankLineEnd) {
    console.log(filename, '- The file must end with one blank line')
  }

  const twoBlankLinesEnd = lines.slice(-1)[0] === '' && lines.slice(-2)[0] === ''
  if (twoBlankLinesEnd) {
    console.log(filename, '- The file must end with one blank line')
  }
}
