const test = require('tape')
const Model = require('../index')
const util = require('util')
const now = require('date-at')

const config = { colors: true, depth: null }

const log = function (o) {
  console.log(util.inspect(o, config))
}

test('Type [Date], Single Rule, No Custom Message, No Validators, No Braces (Passing)', assert => {
  const m1 = Model.compile(`
    Date created
  `)

  const result = m1({
    created: Date.now()
  })

  assert.equal(result.length, 0)
  assert.end()
})

test('Type [Date], Single Rule, No Custom Message, No Validators, No Braces (Failing)', assert => {
  const m1 = Model.compile(`
    Date created
  `)

  const result = m1({
    created: "It's Always Sunny"
  })

  assert.equal(result.length, 1, 'There should be 1 error total')
  assert.equal(result.rules['created'].length, 1, 'The error should be on the "created" rule')
  assert.equal(result.rules['created'][0].validator, 'type')
  assert.equal(result.rules['created'][0].message, '[It\'s Always Sunny] is an invalid Date')
  assert.end()
})

test('Type [Date], Single Rule, No Validators, Custom Message (Passing)', assert => {
  const m1 = Model.compile(`
    Date created "Must contain a valid date"
  `)

  const result = m1({
    created: Date.now()
  })

  assert.equal(result.length, 0)
  assert.end()
})

test('Type [Date], Single Rule, No Validators, Custom Message (Failing)', assert => {
  const m1 = Model.compile(`
    Date created "Must contain a valid date"
  `)

  const result = m1({
    created: "It's Always Sunny"
  })

  assert.equal(result.length, 1)
  assert.equal(result.rules['created'].length, 1)
  assert.equal(result.rules['created'][0].validator, 'type')
  assert.equal(result.rules['created'][0].message, 'Must contain a valid date')
  assert.end()
})

test('Type [Date], Single Rule, Custom Message, No Validators, Empty braces (Passing)', assert => {
  const m1 = Model.compile(`
    Date created "Must contain a valid date" {}
  `)

  const result = m1({
    created: Date.now()
  })

  assert.equal(result.length, 0, 'There should be no errors')
  assert.end()
})

test('Type [Date], Single Rule, Custom Message, No Validators, Empty braces (Failing)', assert => {
  const m1 = Model.compile(`
    Date created 'Must contain a valid date' {}
  `)

  const result = m1({
    created: "It's Always Sunny"
  })

  assert.equal(result.length, 1, 'There must be 1 error total')
  assert.equal(result.rules['created'].length, 1, '1 error found on the "create" rule')
  assert.equal(result.rules['created'][0].validator, 'type', 'It should be a type error')
  assert.equal(result.rules['created'][0].message, 'Must contain a valid date', 'a custom type error message')
  assert.end()
})

test('Type [Date], Single Rule, Single validator with and without custom message, braces, single validator (Passing)', assert => {
  const m1 = Model.compile(`
    Date created "Must contain a valid date" {
      required true "A date is required"
    }
  `)

  const r1 = m1({
    created: Date.now()
  })

  assert.equal(r1.length, 0)

  const m2 = Model.compile(`
    Date created "Must contain a valid date" {
      required true
    }
  `)

  const r2 = m2({
    created: Date.now()
  })

  assert.equal(r2.length, 0)

  assert.end()
})

test('Type [Date], Single Rule, Custom Message, Single Validator, With Braces, Custom Message', assert => {
  const m1 = Model.compile(`
    Date created 'Must contain a valid date' {
      required true "A date is required"
    }
  `)

  const r1 = m1({
  })

  assert.equal(r1.length, 1, 'There must be two errors total')
  assert.equal(r1.rules['created'].length, 1, 'error found on the "created" rule')
  assert.equal(r1.rules['created'][0].validator, 'required', 'Second type is a requirement error')
  assert.equal(r1.rules['created'][0].message, 'A date is required', 'a custom requirement message')

  const m2 = Model.compile(`
    Date created {
      required true
    }
  `)

  const r2 = m2({
  })

  assert.equal(r2.length, 1, 'There must be two errors total')
  assert.equal(r2.rules['created'].length, 1, 'Two errors found on the "created" rule')
  assert.equal(r2.rules['created'][0].validator, 'required', 'Second type is a requirement')
  assert.equal(r2.rules['created'][0].message, 'A value is required', 'standard requirement message')

  assert.end()
})

test('Type [Date], Single Rule, Custom Mesage, Multiple Validators, Braces (Passing)', assert => {
  const m1 = Model.compile(`
    Date created {
      gte now
      required true
    }
  `)

  const r1 = m1({
    created: now('+1h')
  })

  assert.equal(r1.length, 0, '"created", of type Date, is gte to "now"')
  assert.end()
})

test('Type [Date], Single Rule, No Message, Multiple Validators, Braces (Failing)', assert => {
  const m1 = Model.compile(`
    Date created {
      gte now
      required true
    }
  `)

  const r1 = m1({
    created: now('-1h')
  })

  assert.equal(r1.length, 1, '"created", of type Date, is not gte to "now"')
  assert.end()
})

test('Type [Date], Single Rule, No Message, Multiple Validators, No Messages (Failing)', assert => {
  const m1 = Model.compile(`
    Date created {
      gte now
      required true
    }
  `)

  const r1 = m1({
    created: now('-1h')
  })

  assert.equal(r1.length, 1, '"created", of type Date, is not gte to "now"')
  assert.end()
})

test('Type [Date], Multiple Rules, Multiple Validators, Custom messages (Passing)', assert => {
  const m1 = Model.compile(`
    Date created {
      gte now
      required true
    }
    String name
  `)

  const r1 = m1({
    created: now('+1h'),
    name: 'Beep Boop'
  })

  assert.equal(r1.length, 0)
  assert.end()
})

test('Type [Date], Multiple Rules, Multiple Validators, Custom messages (Failing)', assert => {
  const m1 = Model.compile(`
    Date created {
      gte now
      required true
    }
    String name
  `)

  const r1 = m1({
    created: now('+1h'),
    name: 100
  })

  assert.equal(r1.length, 1)
  assert.end()
})

test('Type [Date], Multiple Rules, No Validators (Failing)', assert => {
  const m1 = Model.compile(`
    Date created
    String name
    Number id
  `)

  const r1 = m1({
    created: now('+1h'),
    name: 'Beep Boop',
    id: 100
  })

  assert.equal(r1.length, 0)
  assert.end()
})

test('Type [Date], Message, Single Rule, No Validators (Failing)', assert => {
  const m1 = Model.compile(`
    Date created "A valid date is required"
  `)

  const r1 = m1({
    created: 'wtf'
  })

  assert.equal(r1.rules.created[0].message, 'A valid date is required')
  assert.end()
})

test('Type [String], perform a match on the value (Passing)', assert => {
  const m1 = Model.compile(`
    String foo {
      match /bar/
    }
  `)

  const result = m1({ foo: 'bar' })
  assert.equal(result.length, 0)
  assert.end()
})

test('Type [String], perform a match on the value, alias (Passing)', assert => {
  const m1 = Model.compile(`
    String foo {
      regexp /bar/
    }
  `)

  const result = m1({ foo: 'bar' })
  assert.equal(result.length, 0)
  assert.end()
})

test('Type [String], perform a match on the value (Failing)', assert => {
  const m1 = Model.compile(`
    String foo {
      match /bazz/ 'Not a match'
    }
  `)

  const result = m1({ foo: 'bar' })
  assert.equal(result.length, 1)
  assert.equal(result.rules.foo[0].message, 'Not a match')
  assert.end()
})

test('Start a file with a comment', assert => {
  const m1 = Model.compile(`// This is a comment
    String foo
  `)

  const result = m1({ foo: 'bar' })
  assert.equal(result.length, 0)
  assert.end()
})

/* test('Custom type', assert => {
  const m1 = Model.compile(`
    def Name {
      type String
      gt 2
      lte 256
    }

    Name username {
      lte 15
    }
  `)

  const result = m1({ username: 'danzig' })
  log(result.rules)
  assert.equal(result.length, 0)
  assert.end()
})
*/
