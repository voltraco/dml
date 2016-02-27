'use strict'
const validimir = require('validimir')
const opath = require('object-path')
const assert = require('assert')
const xtend = require('xtend')
const type = require('./type')

let Model = module.exports = function () {}

function clean (data, model) {
  let output = {}
  for (let k in model) {
    let value = opath.get(data, k)
    opath.set(output, k, value)
  }
  return output
}

function length (results) {
  let count = 0
  for (let r in results) {
    count += (results[r].length || 0)
  }
  return count 
}

let required = { 
  value: 'undefined',
  operator: 'Boolean',
  actual: 'undefined',
  message: 'Value is required'
}

Model.validators = function Validators (optional) {
  let engine = validimir()
  engine.optional = optional
  return engine
}

Model.create = function Model () {

  let args = Array.from(arguments)
  let model = args.shift()
  
  for (let m of args) {
    model = xtend(model, m.model)
  }

  let fn = function fn (data, sanitize) {

    let errors = {}

    if (type(data) !== 'Object') {
      errors[''] = required
      return errors
    }

    for (let key in model) {
      let m = model[key]
      let value = opath.get(data, key)

      if (m.optional && type(value) === 'Undefined') {
        continue
      } else if (type(value) === 'Undefined') {
        errors[key] = (errors[key] || [])
        errors[key].push(required)
        continue
      }
      errors[key] = m(value).errors
    }

    return {
      errors: errors,
      length: length(errors),
      data: sanitize ? clean(data, model) : data
    }
  }

  fn.model = model
  return fn
}

