'use strict'
const he = require('he')
const opath = require('object-path')
const date = require('date-at')

const type = require('./type')

function clean (data, model) {
  const output = {}
  for (const k in model) {
    let value = opath.get(data, k)
    if (typeof value !== 'undefined') {
      try {
        opath.set(output, k, value)
      } catch (_) {
        output[k] = null
      }
    }
  }
  return output
}

function compare (op, a, b) {
  switch (op) {
    case 'lt': return a < b
    case 'lte': return a <= b
    case 'gt': return a > b
    case 'gte': return a >= b
    case 'equal':
    case 'eq': return a === b
  }
}

function cast (type, value) {
  // return (new global[type](value)) // too easy

  switch (type) {
    case 'Undefined': return undefined
    case 'RegExp': return new RegExp(value)
    case 'Date': return new Date(value)
    case 'String': return String(value)
    case 'Object': return value
    case 'Array': return value
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

  return null
}

//
// Validates that an object conforms to a model.
//
module.exports = function Validate (data, model) {
  if (!data || !model) return

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
    let props = rules[rule]

    //
    // Check if this is a custom type, if so, extend the props.
    //
    if (model.types[props.type]) {
      const extendedProps = model.types[props.type]
      props = Object.assign(props, extendedProps)
      props.type = props.type.word
    }

    const rawValue = opath.get(data, rule)
    let value = cast(props.type, rawValue)

    //
    // Check if the property if requied or not.
    //
    const required = props.required || props.require
    const isUndefined = (typeof rawValue === 'undefined') || rawValue === ''

    if (required && isUndefined) {
      const message = required.message || `The property "${rule}" is required.`

      violation(rule, { property: 'required', message })
    } else if (!required && isUndefined) {
      continue
    }

    //
    // Check that the type is correct.
    //
    const actualType = type(value)

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
      match.forEach(m => {
        if (!cast('RegExp', m.regex).exec(rawValue)) {
          const message = m.message ||
            `The expression ${m.regex} did not match the string "${rawValue}".`

          violation(rule, { property: 'match', message })
        }
      })
    }

    //
    // Comparisons
    //
    for (const name in props) {
      if (['lt', 'lte', 'gt', 'gte', 'eq', 'equal'].includes(name)) {
        let expected = null
        let actual = value
        let r = null

        if (props.type === 'Date') {
          expected = date(props[name].word)
        }

        if (props.type === 'Number') {
          expected = Number(props[name].number)
        }

        //
        // in the case where the user wants to specify lt(e)gt(e) on a string
        // the result should be the measurement of the string's length.
        //
        if (props.type === 'String') {
          if (props[name].number) {
            actual = value.length
            expected = Number(props[name].number)
          } else {
            expected = String(props[name].string)
          }
        }

        r = compare(name, actual, expected)

        if (!r) {
          const message = props[name].message ||
            `The value ${actual} was not ${name} ${expected}.`

          violation(rule, { property: 'compare', message })
        }
      }
    }
  }

  return result
}
