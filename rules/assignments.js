const matchMultilineString = require('../lib/match_multiline_string.js')
const ignoreStrings = require('../lib/ignore_strings.js')
const arrayForEach = require('../lib/array_for_each.js')
const arrayCompose = require('../lib/array_compose.js')

module.exports = ({ lines, filename }) => {
  const indentation = [
    '                ',
    '            ',
    '        ',
    '    ',
    ''
  ]

  return indentation.every(indentationLevel => {
    let scopeAssignments = []
    let assignments = []
    let ignoreFunctionScope = false
    let multilineString = {}
    lines.every((line, index) => {
      multilineString = matchMultilineString({ lines, index, filename, multilineString })
      if (multilineString.error) {
        return false
      }

      if (!lines[index].endsWith('<<<STRING') && multilineString.line) {
        return true
      }

      lines[index] = lines[index].replaceAll('reference_to ', '&$')

      if (!lines[index].startsWith(indentationLevel)) return true

      const currentIndentationLevel = lines[index].startsWith(indentationLevel) && !lines[index].startsWith(`${indentationLevel} `)

      if (ignoreFunctionScope && lines[index].startsWith(`${indentationLevel}}`)) {
        ignoreFunctionScope = false
        return true
      }

      if (ignoreFunctionScope) return true

      if (!ignoreFunctionScope && currentIndentationLevel && lines[index].includes('function (')) {
        ignoreFunctionScope = true
      }

      let scopeAssignmentsLine = lines[index - 1]
      if (scopeAssignmentsLine === '') {
        scopeAssignmentsLine = lines[index - 2]
      }
      if (scopeAssignmentsLine && scopeAssignmentsLine.includes('function (')) {
        assignments = []
        scopeAssignments = scopeAssignmentsLine.match(/(?<=function \().*?(?=\))/g)
        if (scopeAssignments) {
          scopeAssignments = [...scopeAssignments][0]

          if (scopeAssignments !== '') {
            if (scopeAssignments !== scopeAssignments.trimStart()) {
              console.log(`${filename} ${index + 1}`, '- Invalid space after opening parentheses.')
              return false
            }

            if (scopeAssignments !== scopeAssignments.trimEnd()) {
              console.log(`${filename} ${index + 1}`, '- Invalid space before closing parentheses.')
              return false
            }

            assignments = assignments.concat(scopeAssignments.replace('...', ''))
          }
        }
        scopeAssignments = scopeAssignmentsLine.match(/(?<=use \().*?(?=\))/g)
        if (scopeAssignments) {
          scopeAssignments = [...scopeAssignments][0]
          if (scopeAssignments !== '') {
            if (scopeAssignments !== scopeAssignments.trimStart()) {
              console.log(`${filename} ${index + 1}`, '- Invalid space after opening parentheses.')
              return false
            }

            if (scopeAssignments !== scopeAssignments.trimEnd()) {
              console.log(`${filename} ${index + 1}`, '- Invalid space after closing parentheses.')
              return false
            }

            scopeAssignments = scopeAssignments.split(', ').map(assignment => {
              return assignment.replace('&$', '')
            })
            assignments = assignments.concat(scopeAssignments)
          }
        }
      }

      let assignmentBadSpacing = false

      arrayCompose([
        {
          line: lines[index],
          transform: line => {
            if (line.includes(':') && !line.includes(' : ')) {
              assignmentBadSpacing = true
            }

            return line
          }
        },
        ignoreStrings
      ])

      if (assignmentBadSpacing) {
        console.log(`${filename} ${index + 1}`, '- There must be a space before and after the colon.')
        return false
      }

      const assignment = lines[index].split(' : ')
      if (assignment.length > 1) {
        lines[index] = lines[index].replace(' : ', ' = ')
        assignments = assignments.concat([assignment[0].trimStart()])
      }

      let functionAssignments = lines[index].match(/(?<=function \().*?(?=\))/g)
      if (functionAssignments) {
        functionAssignments = [...functionAssignments][0]
        if ([',', ':', '='].find(character => functionAssignments.includes(character))) {
          console.log(`${filename} ${index + 1}`, '- Functions must have only one parameter and without default value')
          return false
        }

        if (functionAssignments !== '') {
          assignments = assignments.concat(functionAssignments.replace('...', ''))
        }
      }

      let functionScopeAssignments = lines[index].match(/(?<=use \().*?(?=\))/g)
      if (functionScopeAssignments) {
        functionScopeAssignments = [...functionScopeAssignments][0]
        functionScopeAssignments = functionScopeAssignments.split(', ').map(assignment => {
          return assignment.replace('&$', '')
        })
        assignments = assignments.concat(functionScopeAssignments)
      }

      assignments.every((assignment) => {
        if (lines[index].startsWith(assignment) && !lines[index].startsWith('$')) {
          lines[index] = lines[index].replaceAll(`${assignment} =`, `$${assignment} =`)
        }

        if (lines[index].startsWith(`${assignment}(`)) {
          lines[index] = lines[index].replace(`${assignment}(`, `$${assignment}(`)
        }

        const assignmentsReplacements = [
          [` ${assignment} `, ` $${assignment} `],
          [`...${assignment})`, `...$${assignment})`],
          [`(${assignment})`, `($${assignment})`],
          [`(${assignment},`, `($${assignment},`],
          [`(${assignment}(`, `($${assignment}(`],
          [`, ${assignment},`, `, $${assignment},`],
          [` ${assignment})`, ` $${assignment})`],
          [` ${assignment}(`, ` $${assignment}(`],
          [` ${assignment};`, ` $${assignment};`],
          [` ${assignment}[`, ` $${assignment}[`],
          [`(${assignment}[`, `($${assignment}[`],
          [`[${assignment}]`, `[$${assignment}]`],
          [`[${assignment} `, `[$${assignment} `],
          [` ${assignment},`, ` $${assignment},`]
        ]

        arrayForEach({
          array: assignmentsReplacements,
          iteration: element => {
            const [assignment, replacement] = element
            lines[index] = arrayCompose([
              {
                line: lines[index],
                transform: line => {
                  return line.replaceAll(assignment, replacement)
                }
              },
              ignoreStrings
            ])
          }
        })

        if (lines[index].trimStart().startsWith(`"${assignment}"`) && !lines[index].includes(' => ')) {
          lines[index] = lines[index].replace(`"${assignment}"`, `$${assignment}`)
        }
        if (lines[index].endsWith(` ${assignment}`)) {
          lines[index] = lines[index].replaceAll(` ${assignment}`, ` $${assignment}`)
        }

        return true
      })

      return true
    })
    return true
  })
}
