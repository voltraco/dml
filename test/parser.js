const test = require('tape')
const parse = require('../parser')
const util = require('util')

const config = { colors: true, depth: null }

const log = function (o) {
  console.log(util.inspect(o, config))
}

test('tree should contain a directives array', assert => {
  const m = parse('Boolean x')
  assert.ok(Array.isArray(m.directives))
  assert.end()
})

test('tree should contain a rules object with one rule', assert0 => {
  const m = parse('Boolean x')
  assert0.ok(!!m.rules.x)

  assert0.test('basic rule properties', assert1 => {
    assert1.ok(m.rules.x.message === '', 'there is no custom message on the rule')
    assert1.equal(m.rules.x.type, 'Boolean', 'the type of the rule is a boolean')
    assert1.equal(m.rules.x.rule, 'x', 'the rule is identified as `x`')
    assert1.equal(m.rules.x.required, false, 'the rule was not marked as required')
    assert1.equal(m.rules.x.validators.length, 1, 'there was at least one validator for the rule')
    assert1.equal(m.rules.x.validators[0].name, 'type', 'the default rule name is type')
    assert1.equal(m.rules.x.validators[0].value, 'Boolean', 'the default rule expects a boolean')
    assert1.equal(m.rules.x.pos.lineno, 1, 'the rule is found on the first line of the source text')
    assert1.end()
  })

  assert0.end()
})

test('tree should contain a rules object with one rule (required)', assert => {
  const m = parse(`
    Boolean x "foo" {
      required true
    }
  `)
  assert.ok(m.rules.x.required)
  assert.end()
})

test('tree should contain a rules object with one rule (more properties)', assert0 => {
  const m = parse(`
    Boolean x "foo" {
    }
  `)
  assert0.ok(!!m.rules.x)

  assert0.test('rule properties', assert1 => {
    assert1.ok(m.rules.x.message === 'foo', 'there is a custom message for the rule')
    assert1.equal(m.rules.x.type, 'Boolean', 'the type of the rule is a boolean')
    assert1.equal(m.rules.x.rule, 'x', 'the rule is identified as `x`')
    assert1.equal(m.rules.x.required, false, 'the rule was not marked as required')
    assert1.equal(m.rules.x.validators.length, 1, 'there was at least one validator for the rule')
    assert1.equal(m.rules.x.validators[0].name, 'type', 'the default rule name is type')
    assert1.equal(m.rules.x.validators[0].value, 'Boolean', 'the default rule expects a boolean')
    assert1.equal(m.rules.x.pos.lineno, 2, 'the rule is found on the second line of the source text')
    assert1.end()
  })

  assert0.end()
})

test('tree should contain a rules object with one rule (with validators)', assert0 => {
  const m = parse(`
    String x {
      gte 2
      lte 10
      required true
    }
  `)
  assert0.ok(!!m.rules.x)

  assert0.test('rule properties', assert1 => {
    assert1.ok(m.rules.x.message === '', 'there is no custom message on the rule')
    assert1.equal(m.rules.x.type, 'String', 'the type of the rule is a string')
    assert1.equal(m.rules.x.rule, 'x', 'the rule is identified as `x`')
    assert1.equal(m.rules.x.required, true, 'the rule was not marked as required')
    assert1.equal(m.rules.x.validators.length, 4, 'there was at least one validator for the rule')
    assert1.equal(m.rules.x.validators[0].name, 'type', 'the default rule name is type')
    assert1.equal(m.rules.x.validators[0].value, 'String', 'the default rule expects a boolean')
    assert1.equal(m.rules.x.pos.lineno, 2, 'the rule is found on the second line of the source text')
    assert1.end()
  })

  assert0.end()
})

test('tree should contain a rules object with one rule (with validators)', assert0 => {
  const m = parse(`
    String x {
      gte 2
      lte 10
      required true
    }
    String y {
      gte 3
      lte 11
      match /foo/
    }
  `)
  assert0.ok(!!m.rules.x, 'x rule was created')
  assert0.ok(!!m.rules.y, 'y rule was created')

  assert0.test('rule properties', assert1 => {
    assert1.ok(m.rules.x.message === '', 'there is no custom message on the rule')
    assert1.equal(m.rules.x.type, 'String', 'the type of the rule is a string')
    assert1.equal(m.rules.x.rule, 'x', 'the rule is identified as `x`')
    assert1.equal(m.rules.x.required, true, 'the rule was not marked as required')
    assert1.equal(m.rules.x.validators.length, 4, 'there was at least one validator for the rule')
    assert1.equal(m.rules.x.validators[0].name, 'type', 'the default rule name is type')
    assert1.equal(m.rules.x.validators[0].value, 'String', 'the default rule expects a boolean')
    assert1.equal(m.rules.x.pos.lineno, 2, 'the rule is found on the second line of the source text')

    assert1.ok(m.rules.x.message === '', 'there is no custom message on the rule')
    assert1.equal(m.rules.y.type, 'String', 'the type of the rule is a string')
    assert1.equal(m.rules.y.rule, 'y', 'the rule is identified as `x`')
    assert1.equal(m.rules.y.required, false, 'the rule was not marked as required')
    assert1.equal(m.rules.y.validators.length, 4, 'there was at least one validator for the rule')
    assert1.equal(m.rules.y.validators[0].name, 'type', 'the default rule name is type')
    assert1.equal(m.rules.y.validators[0].value, 'String', 'the default rule expects a boolean')
    assert1.equal(m.rules.y.pos.lineno, 7, 'the rule is found on the second line of the source text')

    assert1.end()
  })

  assert0.end()
})

