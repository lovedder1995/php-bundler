const { readFileSync, writeFileSync } = require('fs')

const aModuleFilename = /(?<=module\(["'])(.*?)(?=["']\))/
const aModuleExpression = /module\(["'](.*?)['"]\);/

const closure = code => `(function () {
${code}
})();
`

const resoveModule = ({ file, moduleFilename }) => {
  if (!moduleFilename) moduleFilename = file.match(aModuleFilename)
  if (!moduleFilename) return file

  let moduleFile = readFileSync(moduleFilename[0], 'utf-8')
    .replace('<?php', '')
    .trim()

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

const bundle = resoveModule({ file: mainFile })

writeFileSync('index.php', bundle)
