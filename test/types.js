var test = require('tape')
var type = require('../type')

test('Type tests', function (assert) {
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
  assert.equal(type(() => {
  }), 'Function')
  assert.equal(type(function () {}), 'Function')
  assert.equal(type(new Function()), 'Function')
  assert.end()
})

