var opath = require('object-path')
var parse = require('./parser')
var fmt = require('util').format
var checkType = require('./type')
var now = require('./now')

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
  var b = now(validator.value)
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

function exp (rule, validator, directives, value) {
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

Model.validators.type = function (rule, validator, directives, value) {
  var originalValue = value
  var expected = validator.value

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

Model.validators.equal = function equal (rule, validator, directives, value) {
  var Type = global[rule.type]

  if (!Type) {
    return fmt('Could not find a type of [%s] to instantiate', Type)
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

  var model = { directives: [], rules: {} }

  models.map(function (m) { // combine all models
    model.directives = m.directives // last one in wins, like css
    for (var key in m.rules) model.rules[key] = m.rules[key]
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

  // console.log(require('util').inspect(model, { colors: true, depth: null }))
  return function (data) {
    var rules = model.rules
    var directives = model.directives

    var result = {
      data: data,
      length: 0,
      rules: {}
    }

    if (directives.indexOf('clean') > -1) {
      data = clean(data, rules)
    }

    if (directives.indexOf('strict') > -1) {
      /* unknown(data, rules).map(function (identifier) {
        errors[identifier].push({
          directive: 'strict',
          message: fmt('[%s], is not defined in the model', identifier)
        })
      }) */
    }

    for (var identifier in rules) {
      var rule = rules[identifier]
      var value = opath.get(data, identifier)

      rule.validators.map(function (validator) {
        var fn = Model.validators[validator.name]

        if (!fn) {
          return error([
            'A rule (', rule, ') ',
            'used a validator (', validator.name, ') ',
            'that was not defined'
          ].join(''),
          rule)
        }

        if (!rule.required && checkType(value) === 'Undefined') return

        var error = fn(rule, validator, directives, value)

        if (error) {
          result.length++
          result.rules[identifier] = result.rules[identifier] || []
          result.rules[identifier].push({
            validator: validator.name,
            message: error
          })
        }
      })
    }
    return result
  }
}

