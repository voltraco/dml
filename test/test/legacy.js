'use strict'

const test = require('tape').test
const type = require('./type')
const Model = require('./index')

const v = Model.validators

test('DSL', assert => {
  let m = Model.create(`

    Number beep "foo" {
      gte 2,
      lte 4
    }

    String boop {
      equal 'upe' 'must be bupe'
    }

    Number x
  `)

  let r1 = m({
    beep: 1,
    boop: 'bupe'
  })

  console.log(r1.errors)

  assert.end()
  process.exit(1)
})

test('the model function returns a validator function', assert => {
  let m = Model.create({
    'bar': v().string('Bar must be a stirng')
  })

  assert.ok(m)
  assert.equal(type(m), 'Function')
  assert.end()
})

test('the validator function validates an object', assert => {
  var message = 'Bar must be a stirng'

  let m = Model.create({
    'bar': v().string(message)
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
    'bar': v(true).string('bar must be a stirng')
  })

  let r = m({ bla: 100 })
  assert.equal(r.length, 0)
  assert.end()
})

test('the model function required', assert => {
  let m = Model.create({
    'bar': v().string('bar must be a stirng')
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

test('DSL single-item model (pass)', assert => {
  let m = Model.create(`
    String beep
  `)

  let r = m({ beep: 'test' })

  assert.equal(type(m), 'Function')
  assert.equal(r.length, 0)
  assert.end()
})

test('DSL single-item model (fail)', assert => {
  let m = Model.create(`
    String beep
  `)

  let r = m({ beep: 10 })

  assert.equal(type(m), 'Function')
  assert.equal(r.length, 1)
  assert.end()
})

test('DSL multiple-item model (pass)', assert => {
  let m = Model.create(`
    String beep
    Number boop
  `)

  let r = m({ beep: 'test', boop: 42 })

  assert.equal(type(m), 'Function')
  assert.equal(r.length, 0)
  assert.end()
})

test('DSL multiple-item model (fail)', assert => {
  let m = Model.create(`
    String beep
    Number boop
  `)

  let r = m({ beep: 'test' })

  assert.equal(type(m), 'Function')
  assert.equal(r.length, 1)
  assert.end()
})

test('DSL multiple-item model (fail)', assert => {
  let m = Model.create(`
    String beep
    Number boop
  `)

  let r = m({ beep: 10, boop: 'barf' })

  assert.equal(type(m), 'Function')
  assert.equal(r.length, 2)
  assert.end()
})

test('DSL multiple-item model with syntax fail (fail)', assert => {
  let beepFailMessage = 'Should contain a beep'
  let boopFailMessage = 'Should contain a boop'

  try {
    let m = Model.create(`
      String beep ${beepFailMessage}
      Number boop "${boopFailMessage}"
    `)
  } catch (ex) {
    assert.equal(ex.message, 'Argument #0 not a function, line #1')
    // assert.ok(ex.message.indexOf('is not a recognized validator') > -1)
    assert.end()
  }
})

test('DSL multiple-item model with message (fail)', assert => {
  let beepFailMessage = 'Should contain a beep'
  let boopFailMessage = 'Should contain a boop'

  let m = Model.create(`
    String beep "${beepFailMessage}"
    Number boop "${boopFailMessage}"
  `)

  let r = m({ beep: 32, boop: 'foobarf' })

  assert.equal(type(m), 'Function')
  assert.equal(r.length, 2)
  assert.equal(r.errors['beep'][0].message, beepFailMessage)
  assert.equal(r.errors['boop'][0].message, boopFailMessage)
  assert.end()
})

test('DSL single-item, mult-line model with message and argument (pass)', assert => {
  let m = Model.create(`
    String beep "foo" {
      len 5
    }
  `)

  let r1 = m({ beep: 'hello' })
  assert.equal(r1.length, 0)

  assert.end()
})

test('DSL single-item single-line model with message and argument (pass)', assert => {
  let m = Model.create(`
    String beep "foo" { len 5 }
  `)

  let r1 = m({ beep: 'hello' })
  assert.equal(r1.length, 0)

  assert.end()
})

test('DSL multiple single-line model with message and argument (pass)', assert => {
  let m = Model.create(`
    String beep "foo" { len 5 }
    String boop "foo" { len 4 }
  `)

  let r1 = m({ beep: 'hello', boop: 'bazz' })
  assert.equal(r1.length, 0)

  assert.end()
})

test('DSL multiple single-line model with messages and argument (fail)', assert => {
  let boopFailMessage = 'this is too short'

  let m = Model.create(`
    String beep "foo" { len 5 "a" }
    String boop "foo" { len 2 "${boopFailMessage}" }
  `)

  let r1 = m({ beep: 'hello', boop: 'bazz' })
  assert.equal(r1.length, 1)
  assert.equal(r1.errors['boop'][0].message, boopFailMessage)

  assert.end()
})

test('DSL multiple multi-line model with messages and argument (fail)', assert => {
  let boopFailMessage = 'this is too short'

  let m = Model.create(`
    String beep "foo" { 
      len 5 "a" 
    }

    String boop {
      len 4 "${boopFailMessage}" 
    }
  `)

  let r1 = m({ beep: 'hello', boop: 'bazz' })
  assert.equal(r1.length, 0)

  assert.end()
})

test('DSL multiple multi-line model with messages and argument (fail)', assert => {
  let m = Model.create(`

    Number beep "foo" {
      gte 2,
      lte 4
    }

    String boop {
      equal 'bupe'
    }

  `)

  let r1 = m({
    beep: 3,
    boop: 'bupe'
  })

  console.log(r1.errors.boop)
  assert.equal(r1.length, 0)

  assert.end()
})
