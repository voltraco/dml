'use strict'
var validimir = require('validimir')
var opath = require('object-path')
var assert = require('assert')
var xtend = require('xtend')
var type = require('./type')

var Model = module.exports = function () {}

function clean (data, model) {
  var output = {}
  for (var k in model) {
    var value = opath.get(data, k)
    opath.set(output, k, value)
  }
  return output
}

function length (results) {
  var count = 0
  for (var r in results) {
    count += (results[r].length || 0)
  }
  return count
}

var required = {
  value: 'undefined',
  operator: 'Boolean',
  actual: 'undefined',
  message: 'Value is required'
}

Model.validators = function Validators (optional) {
  var engine = validimir()
  engine.optional = optional
  return engine
}

Model.create = function Model () {
  var args = Array.from(arguments)
  var model = args.shift()

  for (var m of args) {
    model = xtend(model, m.model)
  }

  var fn = function fn (data, sanitize) {
    var errors = {}

    if (type(data) !== 'Object') {
      errors[''] = required
      return errors
    }

    for (var key in model) {
      var m = model[key]
      var value = opath.get(data, key)

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
