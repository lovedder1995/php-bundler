const { existsSync, mkdirSync, readFileSync, writeFileSync, rmSync } = require('fs')
const EventEmitter = require('events')
const chokidar = require('chokidar')

const eventEmitter = new EventEmitter()

const watcher = chokidar.watch('index.mhp', {
  persistent: true
})

watcher.on('change', () => eventEmitter.emit('compile'))

const indentation = ({ file, filename }) => {
  const lines = file.split('\n')

  const rules = [
    'clutter',
    'end_of_file',
    'spaces',
    'indentation',
    'comments',
    'logical_operators',
    'conditions',
    'closures',
    'arrays',
    'assignments',
    'expressions',
    'comparison_operators',
    'strings',
    'blank_lines'
  ]

  rules.every(rule => require(`./rules/${rule}.js`)({ lines, filename }))

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
    watcher.add(moduleFilename)
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

  moduleFile = closure(moduleFile.trimEnd())

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
  console.clear()
  const mainFile = readFileSync('index.mhp', 'utf-8')

  let bundle = indentation({ file: mainFile, filename: 'index.mhp' })
  bundle = resoveModule({ file: bundle })

  writeFileSync('index.php', `<?php\n${bundle}`)
}

if (!existsSync('modules.mhp')) {
  handleFile()
}

if (existsSync('modules.mhp')) {
  if (!existsSync('php_modules')) {
    mkdirSync('php_modules')
  }

  let needUpdate

  const modulesFile = readFileSync('modules.mhp', 'utf-8')

  if (!existsSync('php_modules/modules.mhp')) {
    needUpdate = true
  }

  if (existsSync('php_modules/modules.mhp')) {
    const installedModules = readFileSync('php_modules/modules.mhp', 'utf-8')
    if (installedModules !== modulesFile) {
      needUpdate = true
    }
  }

  if (!needUpdate) {
    handleFile()
  }

  if (needUpdate) {
    writeFileSync('php_modules/modules.mhp', modulesFile)
    let modules = indentation({ file: modulesFile, filename: 'modules.mhp' })
    modules = eval(`(function () { ${modules} })()`)
    modules.every(async (module, index) => {
      let moduleFile = await fetch(module).then(async response => {
        const text = await response.text()
        if (response.status === 404) {
          console.log(text)
          rmSync('php_modules/modules.mhp')
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
        eventEmitter.emit('compile')
      }

      return true
    })
  }
}

eventEmitter.on('compile', handleFile)
eventEmitter.emit('compile')
