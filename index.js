const { existsSync, mkdirSync, readFileSync, writeFileSync, rmSync } = require('fs')
const EventEmitter = require('events')

const eventEmitter = new EventEmitter()

const indentation = ({ file, filename }) => {
  const lines = file.split('\n')

  require('./rules/clutter.js')({ lines, filename })
  require('./rules/end_of_file.js')({ lines, filename })
  require('./rules/spaces.js')({ lines, filename })
  require('./rules/indentation.js')({ lines, filename })
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
    moduleFile = readFileSync(`php_modules/${moduleFilename}.php`, 'utf-8')
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

const handleFile = () => {
  const mainFile = readFileSync('index.shp', 'utf-8')

  let bundle = indentation({ file: mainFile, filename: 'index.shp' })
  bundle = resoveModule({ file: bundle })

  writeFileSync('index.php', `<?php\n${bundle}`)
}

if (!existsSync('modules.shp')) {
  handleFile()
}

if (existsSync('modules.shp')) {
  if (!existsSync('php_modules')) {
    mkdirSync('php_modules')
  }

  let needUpdate

  const modulesFile = readFileSync('modules.shp', 'utf-8')

  if (!existsSync('php_modules/modules.shp')) {
    needUpdate = true
  }

  if (existsSync('php_modules/modules.shp')) {
    const installedModules = readFileSync('php_modules/modules.shp', 'utf-8')
    if (installedModules !== modulesFile) {
      needUpdate = true
    }
  }

  if (!needUpdate) {
    handleFile()
  }

  if (needUpdate) {
    writeFileSync('php_modules/modules.shp', modulesFile)
    let modules = indentation({ file: modulesFile, filename: 'modules.shp' })
    modules = eval(`(function () { ${modules} })()`)
    modules.every(async (module, index) => {
      let moduleFile = await fetch(module).then(async response => {
        const text = await response.text()
        if (response.status === 404) {
          console.log(text)
          rmSync('php_modules/modules.shp')
          return false
        }
        return text
      })

      if (!moduleFile) return false

      moduleFile = moduleFile.replace('<?php', `<?php\n# ${module}`)
      const moduleParts = module.split('/')

      const vendor = moduleParts[4]
      const repository = moduleParts[5].split('@')[0]

      if (!existsSync(`php_modules/${vendor}`)) {
        mkdirSync(`php_modules/${vendor}`)
      }

      writeFileSync(`php_modules/${vendor}/${repository}.php`, moduleFile)

      if (index === modules.length - 1) {
        eventEmitter.emit('modulesSaved')
      }

      return true
    })
  }
}

eventEmitter.on('modulesSaved', handleFile)
