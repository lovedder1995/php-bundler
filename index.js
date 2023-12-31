const { readFileSync, writeFileSync } = require('fs')

const indentation = ({ file, filename }) => {
  const lines = file.split('\n')

  require('./rules/clutter.js')({ lines, filename })
  require('./rules/end_of_file.js')({ lines, filename })
  require('php-bundler/rules/spaces.js')({ lines, filename })
  require('php-bundler/rules/indentation.js')({ lines, filename })
  require('./rules/comments.js')({ lines, filename })
  require('./rules/logical_operators.js')({ lines, filename })
  require('./rules/conditions.js')({ lines, filename })
  require('./rules/closures.js')({ lines, filename })
  require('./rules/arrays.js')({ lines, filename })
  require('./rules/assignments.js')({ lines, filename })
  require('./rules/expressions.js')({ lines, filename })
  require('./rules/comparison_operators.js')({ lines, filename })
  require('./rules/strings.js')({ lines, filename })
  require('./rules/blank_lines.js')({ lines, filename })

  return lines.join('\n')
}

const aModuleFilename = /(?<=module\(")(.*?)(?="\))/
const aModuleExpression = /module\("(.*?)"\)/

const closure = code => `(function () {
${code}
})()`

const resoveModule = ({ file, moduleFilename }) => {
  if (!moduleFilename) moduleFilename = file.match(aModuleFilename)
  if (!moduleFilename) return file
  moduleFilename = moduleFilename[0]

  let moduleFile

  try {
    moduleFile = readFileSync(`node_modules/${moduleFilename}/index.php`, 'utf-8')
  } catch (error) {
    moduleFile = readFileSync(moduleFilename, 'utf-8')
  }

  if (moduleFile.startsWith('<?php')) {
    moduleFile = moduleFile.replace('<?php\n', '')
  } else {
    moduleFile = indentation({ file: moduleFile, filename: moduleFilename })
  }

  moduleFile = moduleFile.split('\n').map(line => {
    if (line === '') return line
    return `    ${line}`
  }).join('\n')

  moduleFile = closure(moduleFile)

  const bundle = file.replace(aModuleExpression, moduleFile)

  const anotherModuleFilename = bundle.match(aModuleFilename)

  if (anotherModuleFilename) {
    return resoveModule({
      file: bundle,
      moduleFilename: anotherModuleFilename
    })
  }

  return bundle
}

const mainFile = readFileSync('index.shp', 'utf-8')

let bundle = indentation({ file: mainFile, filename: 'index.shp' })
bundle = resoveModule({ file: bundle })

writeFileSync('index.php', `<?php\n${bundle}`)
