module.exports = ({ lines, filename }) => {
  lines.every((line, index) => {
    lines[index] = lines[index].replaceAll('is_equal_to ', '=== ')
    lines[index] = lines[index].replaceAll('is_not_equal_to ', '!== ')
    lines[index] = lines[index].replaceAll('is_less_than ', '< ')
    lines[index] = lines[index].replaceAll('is_greater_than ', '> ')
    lines[index] = lines[index].replaceAll('is_less_than_or_equal_to ', '<= ')
    lines[index] = lines[index].replaceAll('is_greater_than_or_equal_to ', '>= ')

    return true
  })
}
