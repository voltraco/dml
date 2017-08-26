const util = require('util')
const config = { colors: true, depth: null }

module.exports = o => console.log(util.inspect(o, config))
