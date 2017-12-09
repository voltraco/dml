const compile = require('../compiler')
const validate = require('../validator')
const assert = require('assert')

const model = compile(`
Boolean terms
  eq true
  require
`)

const r1 = validate({}, model)
assert(r1.rules.terms[0].property === 'required')
assert(r1.rules.terms[1].property === 'compare')

const r2 = validate({ terms: false }, model)
assert(r2.rules.terms[0].property === 'compare')

const r3 = validate({ terms: true }, model)
assert(!r3.rules.length)
