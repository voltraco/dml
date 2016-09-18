var re = /\[object (\w+)\]/
module.exports = function (v) {
  return ({}).toString.call(v).match(re)[1]
}
