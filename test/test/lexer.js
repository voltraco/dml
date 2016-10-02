var test = require('tape')
var Model = require('../index')
var util = require('util')

var config = { colors: true, depth: null }

var log = function (o) {
  console.log(util.inspect(o, config))
}

test('Lexer tests', function (assert) {
  assert.end()
})

