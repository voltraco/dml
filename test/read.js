const fs = require('fs')
module.exports = p => fs.readFileSync(`${__dirname}/${p}`, 'utf8')
