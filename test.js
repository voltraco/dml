'use strict'

const test = require('tape').test
const type = require('./type')
const Model = require('./index')

const v = Model.validators

test('the type assertion module works as expected', assert => {

  assert.equal(type([]), 'Array')
  assert.equal(type(new Date()), 'Date')
  assert.equal(type({}), 'Object')
  assert.equal(type(0), 'Number')
  assert.equal(type(1), 'Number')
  assert.equal(type(-1), 'Number')
  assert.equal(type(NaN), 'Number')
  assert.equal(type(1e1), 'Number')
  assert.equal(type(0x00a), 'Number')
  assert.equal(type(''), 'String')
  assert.equal(type(``), 'String')
  assert.equal(type(/x/), 'RegExp')
  assert.equal(type(true), 'Boolean')
  assert.equal(type(false), 'Boolean')
  assert.equal(type(()=>{}), 'Function')
  assert.equal(type(function() {}), 'Function')
  assert.equal(type(new Function()), 'Function')
  assert.end()

})

test('the model function returns a validator function', assert => {

  let m = Model.create({
    'bar': v().string('Bar must be a stirng'),
  })

  assert.ok(m)
  assert.equal(type(m), 'Function')
  assert.end()
})

test('the validator function validates an object', assert => {

  var message = 'Bar must be a stirng'

  let m = Model.create({
    'bar': v().string(message),
  })

  let r1 = m({ bar: 'quxx' })
  assert.equal(r1.length, 0)

  let r2 = m({ bar: 100 })
  assert.equal(r2.length, 1)
  assert.equal(r2.errors['bar'][0].message, message)
  assert.equal(r2.errors['bar'][0].value, 100)
  assert.equal(r2.errors['bar'][0].operator, 'string')

  assert.end()
})


test('the validator function validates objects with nested structures (pass)', assert => {


  let m = Model.create({
    'foo.bazz.quxx': v().string('=s'),
    'foo.bazz.bla': v().number({ gt: 10 }),
    'beep': v().object().hasKey('boop').each(v().string())
  })

  let r = m({
    foo: {
      bazz: {
        quxx: 'bar',
        bla: 20
      }
    },
    beep: {
      boop: 'klang'
    }
  })

  assert.equal(r.length, 0)
  assert.end()
})


test('the validator function validates objects with nested structures (fail)', assert => {

  let m = Model.create({
    'foo.bazz.quxx': v().number(),
    'foo.bazz.bla': v().number().equal({ lt: 10 }),
    'beep': v().object().hasKey('boop').each(v().string())
  })

  let r = m({
    foo: {
      bazz: {
        quxx: 'bar',
        bla: 20
      }
    },
    beep: {
      boop: 'klang'
    }
  })

  assert.equal(r.length, 2)
  assert.end()
})

test('the model function optional', assert => {

  let m = Model.create({
    'bar': v(true).string('bar must be a stirng'),
  })

  let r = m({ bla: 100 })
  assert.equal(r.length, 0)
  assert.end()
})


test('the model function required', assert => {

  let m = Model.create({
    'bar': v().string('bar must be a stirng'),
  })

  let r = m({ bla: 100, bar: 'hello' }, true)
  assert.equal(r.length, 0)
  assert.end()
})

test('extend a model with one or more models (failing)', assert => {

  let m1 = Model.create({
    'bar': v().string('bar must be a stirng')
  })

  let m2 = Model.create({
    'bla': v().number('bla must be a number')
  }, m1)

  let r = m2({ bla: 'hello', bar: 100 })

  assert.equal(r.length, 2)
  assert.end()
})

test('extend a model with one or more models (passing)', assert => {

  let m1 = Model.create({
    'bar': v().string('bar must be a stirng')
  })

  let m2 = Model.create({
    'bla': v().number('bla must be a number')
  }, m1)

  let r = m2({ bla: 100, bar: 'hello' })

  assert.equal(r.length, 0)
  assert.end()
})

