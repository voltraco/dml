'use strict'
const opath = require('object-path')

const error = require('./error')

const tokens = {}

tokens.indent = /^\s+/
tokens.word = /^\w+/
tokens.whitespace = /\s*/
tokens.directive = /^@\w+/
tokens.path = /\S+/
tokens.string = /"(?:[^"\\]|\\.)*"/
tokens.number = /^[\d.,]+/
tokens.match = /^\/[^/]+\//

tokens.linecomment = /\s+\/\/\s+/
tokens.blockcomment = /(\/\*(.*?)\*\/)/

module.exports = function Parser (source) {
  const tree = { directives: { imports: [] }, rules: {} }

  const lines = source.split(/\n/)
  let parent = null

  function matcher (re, no) {
    var m = re.exec(lines[no])
    if (m === null) return
    var str = m[0]
    lines[no] = lines[no].slice(m.index + str.length)
    return m
  }

  function removeLineComments (lines, no) {
    lines[no] = lines[no].split(tokens.linecomment)[0]
  }

  for (const no in lines) {
    const line = lines[no]

    removeLineComments(lines, no)

    if (!line) continue

    const indent = matcher(tokens.indent, no)

    if (indent) {
      if (!parent) {
        return error('Found property without parent rule', lines, no)
      }

      const propname = matcher(tokens.word, no)
      const rule = opath.get(tree.rules, parent)

      matcher(tokens.whitespace, no)
      const number = matcher(tokens.number, no)

      matcher(tokens.whitespace, no)
      const match = matcher(tokens.match, no)

      matcher(tokens.whitespace, no)
      const word = matcher(tokens.word, no)

      matcher(tokens.whitespace, no)
      const string = matcher(tokens.string, no)

      matcher(tokens.whitespace, no)
      const message = matcher(tokens.string, no)

      if (propname) {
        rule[propname[0]] = {}
      } else {
        return error('Expected property or type', lines, no)
      }

      if (number) rule[propname[0]].number = number[0].trim()
      if (match) rule[propname[0]].regex = match[0].trim()
      if (word) rule[propname[0]].word = word[0].trim()

      if ((word || number || match) && string) {
        rule[propname[0]].message = string[0].trim()
      } else {
        if (string) rule[propname[0]].string = string[0].trim()
      }

      if (message) rule[propname[0]].message = message[0].trim()

      continue
    }

    const directive = matcher(tokens.directive, no)

    if (directive) {
      const type = directive[0].slice(1)
      const value = lines[no].trim()
      if (type === 'import') {
        tree.directives.imports.push({ no, path: value })
      } else {
        tree.directives[type] = value
      }
      continue
    }

    const word = matcher(tokens.word, no)

    if (word) {
      const type = word[0]
      const path = matcher(tokens.path, no)
      const message = matcher(tokens.string, no)

      if (!path) {
        return error('Rule has type but no property path or name', lines, no)
      }

      parent = path

      opath.set(tree.rules, path, {
        type,
        message: (message && message[0].trim()) || ''
      })

      continue
    }
  }

  return tree
}
