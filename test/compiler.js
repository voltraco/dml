var test = require('tape')
var Model = require('../index')
var fs = require('fs')
var util = require('util')
var now = require('../now')

var config = { colors: true, depth: null }

var log = function (o) {
  console.log(util.inspect(o, config))
}

test('Type [Date], Single Rule, No Custom Message, No Validators, No Braces (Passing)', function (assert) {
  var m1 = Model.compile(`
    Date created
  `)

  var result = m1({
    created: Date.now()
  })

  assert.equal(result.length, 0)
  assert.end()
})

test('Type [Date], Single Rule, No Custom Message, No Validators, No Braces (Failing)', function (assert) {
  var m1 = Model.compile(`
    Date created
  `)

  var result = m1({
    created: "It's Always Sunny"
  })

  assert.equal(result.length, 1, 'There should be 1 error total')
  assert.equal(result.errors['created'].length, 1, 'The error should be on the "created" rule')
  assert.equal(result.errors['created'][0].validator, 'type')
  assert.equal(result.errors['created'][0].message, '[It\'s Always Sunny] is an invalid Date')
  assert.end()
})

test('Type [Date], Single Rule, No Validators, Custom Message (Passing)', function (assert) {
  var m1 = Model.compile(`
    Date created "Must contain a valid date"
  `)

  var result = m1({
    created: Date.now()
  })

  assert.equal(result.length, 0)
  assert.end()
})

test('Type [Date], Single Rule, No Validators, Custom Message (Failing)', function (assert) {
  var m1 = Model.compile(`
    Date created "Must contain a valid date"
  `)

  var result = m1({
    created: "It's Always Sunny"
  })

  assert.equal(result.length, 1)
  assert.equal(result.errors['created'].length, 1)
  assert.equal(result.errors['created'][0].validator, 'type')
  assert.equal(result.errors['created'][0].message, 'Must contain a valid date')
  assert.end()
})

test('Type [Date], Single Rule, Custom Message, No Validators, Empty braces (Passing)', function (assert) {
  var m1 = Model.compile(`
    Date created "Must contain a valid date" {}
  `)

  var result = m1({
    created: Date.now()
  })

  assert.equal(result.length, 0, 'There should be no errors')
  assert.end()
})

test('Type [Date], Single Rule, Custom Message, No Validators, Empty braces (Failing)', function (assert) {
  var m1 = Model.compile(`
    Date created 'Must contain a valid date' {}
  `)

  var result = m1({
    created: "It's Always Sunny"
  })

  assert.equal(result.length, 1, 'There must be 1 error total')
  assert.equal(result.errors['created'].length, 1, '1 error found on the "create" rule')
  assert.equal(result.errors['created'][0].validator, 'type', 'It should be a type error')
  assert.equal(result.errors['created'][0].message, 'Must contain a valid date', 'a custom type error message')
  assert.end()
})

test('Type [Date], Single Rule, Single validator with and without custom message, braces, single validator (Passing)', function (assert) {
  var m1 = Model.compile(`
    Date created "Must contain a valid date" {
      required true "A date is required"
    }
  `)

  var r1 = m1({
    created: Date.now()
  })

  assert.equal(r1.length, 0)

  var m2 = Model.compile(`
    Date created "Must contain a valid date" {
      required true
    }
  `)

  var r2 = m2({
    created: Date.now()
  })

  assert.equal(r2.length, 0)

  assert.end()
})

test('Type [Date], Single Rule, Custom Message, Single Validator, With Braces, Custom Message', function (assert) {
  var m1 = Model.compile(`
    Date created 'Must contain a valid date' {
      required true "A date is required"
    }
  `)

  var r1 = m1({
  })

  assert.equal(r1.length, 2, 'There must be two errors total')
  assert.equal(r1.errors['created'].length, 2, 'Two errors found on the "created" rule')
  assert.equal(r1.errors['created'][0].validator, 'type', 'First type is a type error')
  assert.equal(r1.errors['created'][1].validator, 'required', 'Second type is a requirement error')
  assert.equal(r1.errors['created'][0].message, 'Must contain a valid date', 'a custom type message')
  assert.equal(r1.errors['created'][1].message, 'A date is required', 'a custom requirement message')

  var m2 = Model.compile(`
    Date created {
      required true
    }
  `)

  var r2 = m2({
  })

  assert.equal(r2.length, 2, 'There must be two errors total')
  assert.equal(r2.errors['created'].length, 2, 'Two errors found on the "created" rule')
  assert.equal(r2.errors['created'][0].validator, 'type', 'First type is a type violation')
  assert.equal(r2.errors['created'][1].validator, 'required', 'Second type is a requirement')
  assert.equal(r2.errors['created'][0].message, '[undefined] is an invalid Date', 'standard type message')
  assert.equal(r2.errors['created'][1].message, 'A value is required', 'standard requirement message')

  assert.end()
})

test('Type [Date], Single Rule, Custom Mesage, Multiple Validators, Braces (Passing)', function (assert) {
  var m1 = Model.compile(`
    Date created {
      gte now
      required true
    }
  `)

  var r1 = m1({
    created: now('+1h')
  })

  assert.equal(r1.length, 0, '"created", of type Date, is gte to "now"')
  assert.end()
})

test('Type [Date], Single Rule, No Message, Multiple Validators, Braces (Failing)', function (assert) {
  var m1 = Model.compile(`
    Date created {
      gte now
      required true
    }
  `)

  var r1 = m1({
    created: now('-1h')
  })

  assert.equal(r1.length, 1, '"created", of type Date, is not gte to "now"')
  assert.end()
})

test('Type [Date], Single Rule, No Message, Multiple Validators, No Messages (Failing)', function (assert) {
  var m1 = Model.compile(`
    Date created {
      gte now
      required true
    }
  `)

  var r1 = m1({
    created: now('-1h')
  })

  assert.equal(r1.length, 1, '"created", of type Date, is not gte to "now"')
  assert.end()
})

test('Type [Date], Multiple Rules, Multiple Validators, Custom messages (Passing)', function (assert) {
  var m1 = Model.compile(`
    Date created {
      gte now
      required true
    }
    String name
  `)

  var r1 = m1({
    created: now('+1h'),
    name: 'Beep Boop'
  })

  assert.equal(r1.length, 0)
  assert.end()
})

test('Type [Date], Multiple Rules, Multiple Validators, Custom messages (Failing)', function (assert) {
  var m1 = Model.compile(`
    Date created {
      gte now
      required true
    }
    String name
  `)

  var r1 = m1({
    created: now('+1h'),
    name: 100
  })

  assert.equal(r1.length, 1)
  assert.end()
})

test('Type [Date], Multiple Rules, No Validators (Failing)', function (assert) {
  var m1 = Model.compile(`
    Date created
    String name
    Number id
  `)

  var r1 = m1({
    created: now('+1h'),
    name: 'Beep Boop',
    id: 100
  })

  assert.equal(r1.length, 0)
  assert.end()
})
