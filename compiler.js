'use strict'
const path = require('path')
const fs = require('fs')

const parse = require('./parser')
const error = require('./error')

function merge (a, b) {
  if (Array.isArray(a)) {
    a = [...a, b]
    return
  }

  a = { ...a, ...b }
}

//
// Handles imports and creating a model object via the parser.
module.exports = function Compile (source, pwd) {
  let model = {}

  try {
    model = parse(source)
  } catch (ex) {
    process.stdout.write(ex.message)
    return null
  }

  model.directives.imports.forEach(p => {
    const include = path.resolve(pwd, p.path)

    let raw = ''

    try {
      raw = fs.readFileSync(include, 'utf8')
    } catch (ex) {
      const lines = source.split(/\n/)
      return error(`Unable to read the file ${include}`, lines, p.no)
    }

    const m = Compile(raw, path.dirname(include) || '')
    for (const prop in m.rules) merge(model.rules[prop], m.rules[prop])
    for (const prop in m.types) model.types[prop] = m.types[prop]
  })

  return model
}
