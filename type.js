module.exports = (v) => {
  return ({}).toString.call(v).match(/\[object (\w+)\]/)[1]
}

