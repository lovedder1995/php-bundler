const { readFileSync, writeFileSync } = require('fs')

const indentation = ({ file, filename }) => {
  const lines = file.split('\n')

  require('php-bundler/rules/spaces.js')({ lines, filename })
  require('php-bundler/rules/indentation.js')({ lines, filename })
  require('./rules/comments.js')({ lines, filename })
  require('./rules/end_of_file.js')({ lines, filename })
  require('./rules/expressions.js')({ lines, filename })
  require('./rules/functions.js')({ lines, filename })

  return lines.join('\n')
}

const aModuleFilename = /(?<=module\(["'])(.*?)(?=["']\))/
const aModuleExpression = /module\(["'](.*?)['"]\)/

const closure = code => `(function () {
${code}
})()`

const resoveModule = ({ file, moduleFilename }) => {
  if (!moduleFilename) moduleFilename = file.match(aModuleFilename)
  if (!moduleFilename) return file
  moduleFilename = moduleFilename[0]

  let moduleFile = readFileSync(moduleFilename, 'utf-8')

  moduleFile = indentation({ file: moduleFile, filename: moduleFilename })

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

const mainFile = readFileSync('main.php', 'utf-8')

let bundle = indentation({ file: mainFile, filename: 'main.php' })
bundle = resoveModule({ file: bundle })

writeFileSync('index.php', `<?php\n${bundle}`)
