const test = require('tape')
const Model = require('../index')

test('define custom types', assert => {
  const m1 = Model.compile(`
    def Password {
      type String
      gte 3
      lte 15
    }

    Password mypass {
      required true 'a pwd is reqd'
    }
  `)

  const r0 = m1({ mypass: 'abc123' })

  assert.equal(r0.length, 0)

  const r1 = m1({ foo: 1 })

  assert.equal(r1.length, 1)

  assert.end()
})
