var QUOTED_RE = /^"|'/
var OPEN_RE = /^{\s*/
var CLOSE_RE = /^}/
var WORD_RE = /^([-|+]?\w+)/
var WHITESPACE_RE = /^[^\S\x0a\x0d]*/ // but not new lines
var ANYSPACE_RE = /^\s*/ // any whitespace
var NON_WHITESPACE_RE = /^\S+/ // any non whitespace
var NEWLINE_RE = /[\x0a\x0d]+/ // the next NL

//
// Lexer() provides a simple API that can read and reduce a source stream.
// each method is either a helper or a matcher that represents a token.
//
module.exports = function Lexer (str, options) {
  options = options || {}

  var lexer = {
    source: str.slice()
  }

  var lineno = 1
  var column = 1

  function updatePosition (str) {
    var lines = str.match(/\n/g)
    if (lines) lineno += lines.length
    var i = str.lastIndexOf('\n')
    column = ~i ? str.length - i : column + str.length
  }

  function matcher (re) {
    var m = re.exec(lexer.source)
    // console.log('>', arguments.callee.caller.name, "'" + m + "'")
    if (m === null) return
    var str = m[0]
    updatePosition(str)
    lexer.source = lexer.source.slice(m.index + str.length)
    return m
  }

  lexer.data = function () {
    return lexer.source
  }

  lexer.pos = function () {
    return { column: column, lineno: lineno }
  }

  lexer.length = function () {
    return lexer.source.length
  }

  lexer.exec = function (re) {
    return re.exec(lexer.source)
  }

  lexer.peek = function (index, len) {
    return lexer.source.slice(index || 0, len || 1)
  }

  lexer.pop = function (index, len) {
    var s = lexer.source.slice(index || 0, len || 1)
    lexer.source = lexer.source.slice(len || 1)
    return s
  }

  lexer.error = function error (msg) {
    var err = new SyntaxError([
      msg, ':',
      lineno, ':',
      column
    ].join(''))
    err.reason = msg
    err.line = lineno
    err.column = column
    throw err
  }

  var pm = lexer.match = {}

  pm.whitespace = function whitespace () {
    return matcher(WHITESPACE_RE)
  }

  pm.anyspace = function anyspace () {
    return matcher(ANYSPACE_RE)
  }

  pm.newline = function newline () {
    return matcher(NEWLINE_RE)
  }

  pm.open = function open () {
    return matcher(OPEN_RE)
  }

  pm.close = function close () {
    return matcher(CLOSE_RE)
  }

  pm.string = function string () {
    var quote = matcher(QUOTED_RE)
    if (!quote) return

    var value = ''
    while (lexer.source[0] !== quote[0]) {
      if (lexer.length() === 0) {
        lexer.error('missing end of string')
      }
      value += lexer.source[0]
      lexer.source = lexer.source.slice(1)
    }
    lexer.source = lexer.source.slice(1)
    updatePosition(value)
    return value
  }

  pm.nonwhitespace = function nonwhitespace () {
    return matcher(NON_WHITESPACE_RE)
  }

  pm.comment = function comment () {
    var pair = lexer.peek(0, 2)
    var value = ''

    if (pair === '//') {
      value = lexer.pop(0, 2)

      while (true) {
        var ch = lexer.peek()
        if (/[\x0a\x0d]+/.test(ch)) break
        value += lexer.pop()
      }

      updatePosition(value)
    } else if (pair === '/*') {
      value = lexer.pop(0, 2)

      while (true) {
        if (lexer.length() === 0) {
          lexer.error('missing end of comment')
        }

        value += ch = lexer.pop()

        var next = lexer.peek()
        if (ch + next === '*/') {
          value += lexer.pop()
          break
        }
      }
      updatePosition(value)
    }
    return value
  }

  pm.regex = function regex () {
    var ch = lexer.peek(0, 1)
    var next = lexer.peek(1, 2)
    var value = ''

    if (ch === '/' && next !== '/') {
      lexer.pop()

      while (true) {
        if (lexer.length() === 0) {
          lexer.error('missing end of regular expression')
        }

        var prev = ch
        value += ch = lexer.pop()
        next = lexer.source[0]

        if (prev !== '\\' &&
          ch === '/' &&
          (next === ' ' || next === '\n')) {
          updatePosition(value)
          return value.slice(0, -1)
        }
      }
    }
    return
  }

  pm.word = function word () {
    var m = matcher(WORD_RE)
    return m && m[0]
  }

  pm.directive = function directive (delimiter) {
    var m = matcher(new RegExp('^' + delimiter + '\\S+'))
    return m && m[0]
  }

  return lexer
}
