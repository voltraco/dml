const test = require('tape')
const Model = require('../index')
const util = require('util')

const config = { colors: true, depth: null }
const log = o => console.log(util.inspect(o, config))

const a = `
  @clear
  String x {}
  String y {}
`

test('clear models', assert => {
  const m1 = Model.compile(a)

  const r0 = m1({
    x: 1,
    y: 1,
    z: 1
  })

  assert.equal(r0.length, 0)
  log(r0)
  assert.end()
})

