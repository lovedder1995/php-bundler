module.exports = ({ lines, filename }) => {
  const clutter = {
    echo: 'print',
    sizeof: 'count'
  }
  lines.every((line, index) => {
    Object.keys(clutter).every(functionToAvoid => {
      if (
        line.trimStart() === functionToAvoid ||
        line.trimStart().startsWith(`${functionToAvoid}(`) ||
        line.includes(` ${functionToAvoid}(`) ||
        line.includes(`[${functionToAvoid}(`) ||
        line.includes(`(${functionToAvoid}(`)
      ) {
        console.log(`${filename} ${index + 1}`, `- Use ${clutter[functionToAvoid]}() insted of ${functionToAvoid}()`)
        return false
      }

      return true
    })

    return true
  })
}
