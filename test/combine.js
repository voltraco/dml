const test = require('tape')
const Model = require('../index')
const util = require('util')
const path = require('path')
const fs = require('fs')

const config = { colors: true, depth: null }

const log = o => console.log(util.inspect(o, config))
const read = f => fs.readFileSync(path.join(__dirname, f), 'utf8')

test('combine models', assert => {
  const a = read('./fixtures/a.model')
  const b = read('./fixtures/b.model')
  const m1 = Model.compile(a, b)

  const r0 = m1({
    foo: 'bar',
    bar: 1
  })

  assert.equal(r0.length, 0)

  const r1 = m1({
    foo: 'bar'
  })

  assert.equal(r1.length, 1)
  assert.ok(r1.rules.bar)

  const r2 = m1({
    bar: 1
  })

  assert.equal(r2.length, 1)
  assert.ok(r2.rules.foo)

  assert.end()
})
