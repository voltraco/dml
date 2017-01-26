var opath = require('object-path')
var date = require('date-at')
var parse = require('./parser')
var fmt = require('util').format
var checkType = require('./type')

var Model = module.exports = {}

function clean (data, model) {
  var output = {}
  for (var k in model) {
    var value = opath.get(data, k)
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

function dateExpression (validator, value) {
  var msg = validator.message || fmt('[%s] was not [%s] now',
    value, validator.name)
  var a = value
  var b = date(validator.value)
  var r = compare(validator.name, a, b)
  if (!r) return msg
}

function numberExpression (validator, value) {
  var msg = validator.message || fmt('[%s] was not [%s] [%s]',
    parseInt(value, 10), validator.name, validator.value)
  var a = parseInt(value, 10)
  var b = parseInt(validator.value, 10)
  var r = compare(validator.name, a, b)
  if (!r) return msg
}

function stringExpression (validator, value) {
  var msg = validator.message || fmt('[%s] was not [%s] [%s]',
    validator.value, validator.type, value)
  var a = null
  var b = null
  if (!isNaN(parseInt(validator.value, 10))) {
    a = value.length
    b = parseInt(validator.value, 10)
  } else {
    a = value
    b = validator.value
  }
  var r = compare(validator.name, a, b)
  if (!r) return msg
}

function exp (rule, validator, model, value) {
  if (rule.type === 'Date') return dateExpression(validator, value)
  else if (rule.type === 'Number') return numberExpression(validator, value)
  else if (rule.type === 'String') return stringExpression(validator, value)
}

//
// validator functions assert truths and then return errors for the
// rule on which they were defined (even type can be overridden). A
// return value of null or undefined will mean that the rule was
// satisfied/valid.
//
Model.validators = {}

Model.validators.type = function (rule, validator, model, value) {
  var originalValue = value
  var expected = validator.value

  // merge in custom type validators
  if (model.types && model.types[rule.type]) {
    var customType = model.types[rule.type]

    rule.validators = rule.validators
      .filter(v => v.name !== 'type')
      .concat(customType.validators)

    rule.validators.map(v => {
      if (v.name === 'type') {
        expected = rule.type = v.value
      }
    })
  }

  if (expected === 'Number') {
    value = parseInt(value, 10)

    if (isNaN(value)) {
      return rule.message || fmt('[%s] is not a number', originalValue)
    }
  }

  if (expected === 'Date') {
    value = new Date(value)

    if (String(value).indexOf('Invalid') > -1) {
      return rule.message || fmt('[%s] is an invalid Date', originalValue)
    }
  }

  if (expected === 'RegExp') {
    try {
      value = new RegExp(value)
    } catch (ex) {
      return rule.message || fmt('[%s] is an invalid regex', originalValue)
    }
  }

  if (checkType(value) !== expected) {
    return fmt(
      'Expected type [%s] but got type [%s]',
      expected, checkType(value)
    )
  }
}

Model.validators.required = function required (rule, validator, _, value) {
  var expected = validator.value

  if (expected === 'true' && !value) {
    return validator.message || 'A value is required'
  }
}

Model.validators.regexp =
Model.validators.regExp =
Model.validators.match = function match (rule, validator, _, value) {
  var expected = validator.value

  if (!new RegExp(expected).exec(value)) {
    var msg = fmt(
      'The regular expression [%s] does not match the value [%s]',
      expected, value)
    return (validator.message || msg)
  }
}

Model.validators.lt = function lt () { return exp.apply(null, arguments) }
Model.validators.lte = function lte () { return exp.apply(null, arguments) }
Model.validators.gt = function gt () { return exp.apply(null, arguments) }
Model.validators.gte = function gte () { return exp.apply(null, arguments) }

Model.validators.equal = function equal (rule, validator, model, value) {
  var Type = global[rule.type]

  if (!Type) {
    return fmt('Could not find a type of [%s] to test with', Type)
  }

  var expected = new Type(validator.value)

  if (expected.valueOf() !== value) {
    return fmt('[%s] was not equal to [%s]', expected, value)
  }
}

//
// function to add a custom validator
//
Model.validator = function (name, fn) {
  Model.validators[name] = fn
}

Model.compile = function Compile () {
  var models = [].slice.call(arguments).map(function (model) {
    return typeof model === 'string' ? parse(model) : model
  })

  var model = { directives: [], rules: {}, types: {} }

  models.map(function (m) { // combine all models
    model.directives = m.directives // last one in wins, like css
    for (var key in m.rules) model.rules[key] = m.rules[key]
    for (var type in m.types) model.types[type] = m.types[type]
  })

  function error (msg, rule) {
    var lineno = rule && rule.pos && rule.pos.lineno
    var column = rule && rule.pos && rule.pos.column
    var err = new Error([
      msg, ':',
      lineno, ':',
      column
    ].join(''))
    err.reason = msg
    err.line = lineno
    err.column = column
    throw err
  }

  return function (data) {
    var rules = model.rules

    var result = {
      data: data,
      length: 0,
      rules: {}
    }

    // cleans all the data
    if (model.directives.indexOf('clean') > -1) data = clean(data, rules)
    // means all items are optional
    var optional = model.directives.indexOf('optional') > -1
    // means all items are required
    var required = model.directives.indexOf('required') > -1

    function addViolation (identifier, name, message) {
      result.length++
      result.rules[identifier] = result.rules[identifier] || []
      result.rules[identifier].push({
        validator: name,
        message: message
      })
    }

    for (var identifier in rules) {
      var rule = rules[identifier]
      var value = opath.get(data, identifier)
      var noValue = checkType(value) === 'Undefined'

      if (!rule.required && noValue) continue

      if (noValue) {
        var fn = Model.validators.required
        var validators = rule.validators.filter(v => v.name === 'required')
        var fail = fn(rule, validators[0], model, value)
        addViolation(identifier, 'required', fail)
        continue
      }

      rule.validators.map(function (validator) {
        var fn = Model.validators[validator.name]

        if (!fn) {
          var msg = 'Rule [%s] has no validator named [%s].'
          return error(fmt(msg, rule, validator.name), rule)
        }

        var fail = fn(rule, validator, model, value)
        if (fail) addViolation(identifier, validator.name, fail)
      })
    }
    return result
  }
}

