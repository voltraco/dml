const re = /\[object (\w+)\]/
module.exports = (v) => {
  return ({}).toString.call(v).match(re)[1]
}
