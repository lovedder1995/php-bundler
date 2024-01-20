const arrayAdd = require('php-bundler/lib/array_add.js')

module.exports = (parameters) => {
  const expectedParameters = [
    'line',
    'transform'
  ]

  const missingParameter = expectedParameters.find(parameter => {
    return !Object.keys(parameters).includes(parameter)
  })

  if (missingParameter) {
    throw Error(`Expected a parameter called ${missingParameter} in ignoreStrings()`)
  }

  let { line, transform } = parameters
  const betweenBackticks = /`(?<=`).+?(?=`)`/g
  let strings = [...line.matchAll(betweenBackticks)]
  if (strings === undefined) {
    return transform(line)
  }

  strings = strings.map(string => string[0])

  line = line.replaceAll(betweenBackticks, '<STRING>')
  line = transform(line)
  return arrayAdd({
    array: strings,
    carry: line,
    iteration: parameters => {
      const line = parameters.carry
      const match = parameters.value

      return line.replace('<STRING>', match)
    }
  })
}
