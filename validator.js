'use strict'
const he = require('he')
const opath = require('object-path')
const date = require('date-at')

const type = require('./type')

function clean (data, model) {
  console.log(data, model)
  const output = {}
  for (const k in model) {
    let value = opath.get(data, k)
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
    case 'eq': return a === b
  }
}

const customTypes = {}

function cast (type, value) {
  // return (new global[type](value)) // too easy

  switch (type) {
    case 'Undefined': return undefined
    case 'RegExp': return new RegExp(value)
    case 'Date': return new Date(value)
    case 'String': return String(value)
    case 'Number': {
      value = parseInt(value, 10)
      if (isNaN(value) || typeof value === 'string') {
        return String()
      }
      return Number(value)
    }
    case 'Boolean': {
      if (value === 'true') return true
      if (value === 'false') return false
      return Boolean(value)
    }
  }

  if (customTypes[type]) {
    return customTypes[type](value)
  }

  return null
}

//
// Validates that an object conforms to a model.
//
module.exports = function Validate (data, model) {
  const cleanFlag = typeof model.directives.clean !== 'undefined'

  if (cleanFlag) {
    data = clean(data, model.rules)
  }

  const rules = model.rules
  const result = { rules: {}, data, length: 0 }

  function violation (rule, violation) {
    result.rules[rule] = result.rules[rule] || []
    result.rules[rule].push(violation)
    ++result.length
  }

  for (const rule in rules) {
    const props = rules[rule]

    const rawValue = opath.get(data, rule)
    let value = cast(props.type, rawValue)

    //
    // Check if the property if requied or not
    //
    const required = props.required || props.require

    if (required && typeof rawValue === 'undefined') {
      const message = required.message || `The property "${rule}" is required.`

      violation(rule, { proprety: 'required', message })
    }

    //
    // Check that the type is correct
    //
    const actualType = type(value)
    console.log(rule, props.type, actualType)
    if (props.type !== actualType) {
      const message = props.message ||
        `Expected type "${props.type}" but got "${actualType}".`

      violation(rule, { property: 'type', message })
    }

    //
    // Escape if requested and the type is of String
    //
    if (props.escape && props.type === 'String') {
      opath.set(data, rule, he.escape(value))
    }

    //
    // If there is a regex, execute it and check for a match
    //
    const match = props.match || props.regex || props.RegExp

    if (match) {
      if (!cast('RegExp', match.regex).exec(rawValue)) {
        const message = match.message ||
          `The expression ${match.regex} did not match the string "${rawValue}".`

        violation(rule, { property: 'match', message })
      }
    }

    //
    // Comparisons
    //
    for (const name in props) {
      if (['lt', 'lte', 'gt', 'gte'].includes(name)) {
        let expected = null
        if (props.type === 'Date') expected = date(props[name].word)
        if (props.type === 'Number') expected = Number(props[name].number)
        if (props.type === 'String') expected = String(props[name].string)

        const actual = value
        const r = compare(props, actual, expected)

        if (r) {
          const message = props[name].message ||
            `The value ${actual} was not ${name} ${expected}.`

          violation(rule, { property: 'match', message })
        }
      }
    }
  }

  return result
}
