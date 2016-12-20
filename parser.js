var Lexer = require('./lexer')
var LINE_HAS_STR_RE = /^.*['"](.*)(\n|$)/
var DIRECTIVE_SYMBOL = '@'

//
// Parser() uses tokens from Lexer() to define the grammer for a
// source stream and output a tree that can be cached or compiled.
// Since we compile models ahead-of-time, there isn't any point in
// optimizing this lexing & parsing into phases. So, just lex inline!
// We will cache model later and throw the data at that structure.
//
module.exports = function Parser (str) {
  var lexer = Lexer(str)
  var tree = { directives: [], rules: {} }
  var type = true

  while (lexer.length() && type) {
    lexer.match.anyspace()

    var directive = lexer.match.directive(DIRECTIVE_SYMBOL)
    if (directive) {
      while (true) {
        lexer.match.whitespace()
        lexer.match.comment()
        lexer.match.anyspace()
        tree.directives.push(directive.slice(1))
        directive = lexer.match.directive(DIRECTIVE_SYMBOL)
        if (!directive) break
      }
    }

    lexer.match.comment()
    lexer.match.anyspace()
    type = lexer.match.word()
    if (!type) break

    lexer.match.whitespace()
    var identifier = lexer.match.nonwhitespace()
    if (!identifier) {
      lexer.error('an identifier or object path is required')
    }

    var message = ''

    if (lexer.exec(LINE_HAS_STR_RE)) {
      lexer.match.whitespace()
      message = lexer.match.string()
    }

    var rule = tree.rules[identifier[0]] = {
      message: message,
      pos: lexer.pos(),
      type: type,
      rule: identifier[0],
      required: false,
      validators: [{
        name: 'type',
        value: type
      }]
    }

    lexer.match.whitespace()
    var open = lexer.match.open()

    if (!open) continue
    var close = lexer.match.close()
    if (close) continue

    lexer.match.anyspace()

    while (true) {
      lexer.match.comment()

      //
      // The first word is the name of the validator
      //
      var name = lexer.match.word()
      lexer.match.whitespace()

      var value = lexer.match.word()
      lexer.match.whitespace()

      if (!value) value = lexer.match.string()
      if (!value) value = lexer.match.regex()
      if (!value) lexer.error('a value is required')

      lexer.match.whitespace()
      lexer.match.comment()
      lexer.match.whitespace()

      if (name === 'required') {
        rule.required = true
      }

      if (name === 'optional') {
        rule.optional = true
      }

      rule.validators.push({
        name: name,
        value: value,
        message: lexer.match.string() || ''
      })

      if (lexer.match.close()) break

      lexer.match.whitespace()
      lexer.match.comment()
      lexer.match.whitespace()
      lexer.match.newline()
      lexer.match.whitespace()
      if (lexer.match.close()) break
    }
  }
  return tree
}
