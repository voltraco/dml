const fs = require('fs')
const util = require('util')
const config = { colors: true, depth: null }

const log = function (o) {
  console.log(util.inspect(o, config))
}

require('./types')
const compile = require('../compiler')
const validate = require('../validate')

const str = fs.readFileSync(`${__dirname}/test.model`, 'utf8')
const model = compile(str)
const result = validate(str)
log(model)
