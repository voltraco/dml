'use strict'
const he = require('he')
const opath = require('object-path')
const date = require('date-at')

const checkType = require('./type')

function clean (data, model, escapeData) {
  const output = {}
  for (const k in model) {
    let value = opath.get(data, k)

    if (escapeData) {
      value = he.escape(value)
    }

    opath.set(output, k, value)
  }
  return output
}

function compare (op, a, b) {
  switch (op) {
    case 'lt': return a < b
    case 'lte': return a <= b
    case 'gt': return a > b
    case 'gte': return a >= b
  }
}

module.exports = function Validate (model) {
  const cleanFlag = typeof model.directives.clean !== 'undefined'

  const rules = model.rules

  for (const rule in rules) {
    console.log(rules[rule])
  }
}
