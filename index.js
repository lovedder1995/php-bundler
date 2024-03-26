const { existsSync, mkdirSync, readFileSync, writeFileSync, rmSync } = require('fs')
const EventEmitter = require('events')
const chokidar = require('chokidar')
const phpArrayReader = require('php-array-reader')

const eventEmitter = new EventEmitter()

const watcher = chokidar.watch('index.mhp', {
  persistent: true
})

watcher.on('change', () => eventEmitter.emit('compile'))

const compile = ({ file, filename }) => {
  const lines = file.split('\n')

  const rules = [
    'clutter',
    'end_of_file',
    'spacing',
    'indentation',
    'comments',
    'logical_operators',
    'conditions',
    'closures',
    'arrays',
    'assignments',
    'expressions',
    'comparison_operators',
    'text',
    'blank_lines'
  ]

  const compiled = rules.every(rule => require(`./rules/${rule}.js`)({ lines, filename }))

  if (!compiled) {
    return { error: true }
  }

  return { compiled: lines.join('\n') }
}

const aModuleFilename = /(?<=module\(")(.*?)(?="\))/
const aModuleExpression = /module\("(.*?)"\)/

const closure = parameters => {
  const { name, code } = parameters

  return `define("${name}", function () {
${code}
})`
}

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
    moduleFile = compile({ file: moduleFile, filename: moduleFilename })
    if (moduleFile.error) {
      return
    }

    moduleFile = moduleFile.compiled
  }

  moduleFile = moduleFile.split('\n').map(line => line).join('\n')

  moduleFile = closure({
    name: moduleFilename,
    code: moduleFile.trimEnd()
  })

  let bundle = file.replace(aModuleExpression, `constant("${moduleFilename}")()`)
  if (!bundle.includes('# </php-modules>\n')) {
    bundle = `\n# <php-modules>\n\n# </php-modules>\n\n${bundle}`
  }
  if (!bundle.includes(moduleFile)) {
    bundle = bundle.replace('# </php-modules>\n', `${moduleFile};\n\n# </php-modules>\n`)
  }

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
  if (mainFile === '') {
    return
  }

  let bundle = compile({ file: mainFile, filename: 'index.mhp' })
  if (bundle.error) {
    return
  }

  bundle = resoveModule({ file: bundle.compiled })

  writeFileSync('index.php', `<?php\n${bundle}`)
}

if (!existsSync('manifest.mhp')) {
  handleFile()
}

if (existsSync('manifest.mhp')) {
  if (!existsSync('php_modules')) {
    mkdirSync('php_modules')
  }

  let needUpdate

  const manifestFile = readFileSync('manifest.mhp', 'utf-8')

  if (!existsSync('php_modules/manifest.mhp')) {
    needUpdate = true
  }

  if (existsSync('php_modules/manifest.mhp')) {
    const installedModules = readFileSync('php_modules/manifest.mhp', 'utf-8')
    if (installedModules !== manifestFile) {
      needUpdate = true
    }
  }

  if (!needUpdate) {
    handleFile()
  }

  if (needUpdate) {
    writeFileSync('php_modules/manifest.mhp', manifestFile)
    let manifest = compile({ file: manifestFile, filename: 'manifest.mhp' })
    if (manifest.error) {
      throw Error(manifest.error)
    }
    manifest = phpArrayReader.fromString(manifest.compiled.replace('return ', ''))
    const modules = manifest.modules
    modules.every(async (module, index) => {
      let moduleFile = await fetch(module).then(async response => {
        const text = await response.text()
        if (response.status === 404) {
          console.log(text)
          rmSync('php_modules/manifest.mhp')
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
