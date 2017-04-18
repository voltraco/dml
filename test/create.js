const Model = require('../index')
const test = require('tape')

test('create a model without data', assert => {
  const m = Model.compile(`
    Boolean x "foo" {
      required true
    }

    String str "bar" {
      gte 10
    }

    Number quxx.bazz {
      gt 10
    }

    Foo bar {}
  `)

  const d = m()

  const expected = {
    data: {
      x: false,
      str: '',
      quxx: {
        bazz: 0
      },
      bar: null
    },
    length: 0,
    rules: {}
  }

  assert.deepEqual(d, expected, 'object without data was created')
  assert.end()
})
