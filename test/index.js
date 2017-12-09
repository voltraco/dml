const test = require('tape')

// const log = require('./log')
const read = require('./read')
const compile = require('../compiler')
const validate = require('../validator')

require('./types')

const model = compile(read('./test.model'))

test('passing tests', assert => {
  const data = {
    created: '12/24/2002',
    name: 'john doe',
    html: '<a href="as"></a>',
    bla: {
      foo: true
    },
    from: {
      a: 'OK',
      b: 1
    },
    bool: {
      t: true,
      f: false
    },
    quxx: {
      boop: 'beep'
    },
    eq99: 99,
    lt10: 9,
    fuzzbar: 'OK',
    lte10: 10,
    butts: true,
    short: 'hello',
    gt10: 11,
    gte10: 10
  }

  const result = validate(data, model)
  // log(result)

  const expected = {
    created: '12/24/2002',
    bool: {
      t: true,
      f: false
    },
    quxx: {
      boop: 'beep'
    },
    html: '&lt;a href=&quot;as&quot;&gt;&lt;/a&gt;',
    eq99: 99,
    gt10: 11,
    lt10: 9,
    short: 'hello',
    gte10: 10,
    fuzzbar: 'OK',
    from: { a: 'OK', b: 1 }
  }

  assert.equal(result.length, 0)
  assert.deepEqual(expected, result.data)

  assert.end()
})

test('failing tests', assert => {
  const data = {
    created: '12/24/2042',
    name: 'john doe',
    html: 42,
    bla: {
      foo: true
    },
    from: {
    },
    bool: {
      f: false
    },
    eq99: 1,
    lt10: 10,
    lte10: 11,
    butts: true,
    short: '12345678901234567890',
    gt10: 1,
    gte10: 9
  }

  const violations = validate(data, model).rules

  assert.ok(violations.fuzzbar[0].message === 'msg')

  assert.end()
})
