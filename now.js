
module.exports = function (str) {
  var d = new Date()

  if (str === 'now' || !str) return d

  var op = str[0]
  str = str.slice(1)

  var qty = parseInt(str, 10)
  var unit = str.slice(String(qty).length).trim()

  function calc (d, qty, unit) {
    qty = (op === '+' ? 1 : -1) * qty

    switch (unit) {
      case 'years':
      case 'year':
      case 'yr':
      case 'Y':
        d.setFullYear(d.getFullYear() + qty)
        break
      case 'months':
      case 'month':
      case 'mo':
      case 'M':
        d.setMonth(d.getMonth() + qty)
        break
      case 'weeks':
      case 'week':
      case 'w':
        return calc(d, qty * 7, 'days')
      case 'days':
      case 'day':
      case 'd':
        d.setDate(d.getDate() + qty)
        break
      case 'hours':
      case 'hour':
      case 'h':
        d.setHours(d.getHours() + qty)
        break
      case 'minutes':
      case 'minute':
      case 'm':
        d.setMinutes(d.getMinutes() + qty)
        break
      case 'seconds':
      case 'second':
      case 's':
        d.setSeconds(d.getSeconds() + qty)
        break
      case 'milliseconds':
      case 'millisecond':
      case 'ms':
        d.setMilliseconds(d.getMilliseconds() + qty)
        break
      default:
        throw new Error('Invalid range: ' + unit)
    }
    return d
  }

  return calc(d, qty, unit)
}
