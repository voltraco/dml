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
tokens.message = /"(?:[^"\\]|\\.)*"$/
tokens.number = /^[\d.,]+/
tokens.match = /^\/([^/]+)\//
tokens.define = /^def/
tokens.linecomment = /\s+\/\/\s+/

module.exports = function Parser (source) {
  const tree = { directives: { imports: [] }, rules: {}, types: {} }

  const lines = source && source.split(/\n/)
  let parent = null
  let parentIsType = false

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
    removeLineComments(lines, no)

    let [line, message] = lines[no].split(/\s*"([^"\\]+)"$/)
    lines[no] = line

    if (!line) continue

    const indent = matcher(tokens.indent, no)

    if (indent) {
      if (!parent) {
        return error('Found property without parent rule', lines, no)
      }

      const propname = matcher(tokens.word, no)
      const rule = opath.get(parentIsType ? tree.types : tree.rules, parent)

      matcher(tokens.whitespace, no)
      const number = matcher(tokens.number, no)

      matcher(tokens.whitespace, no)
      const match = matcher(tokens.match, no)

      matcher(tokens.whitespace, no)
      const word = matcher(tokens.word, no)

      matcher(tokens.whitespace, no)
      const string = matcher(tokens.string, no)

      if (propname) {
        rule[propname[0]] = rule[propname[0]] || {}
      } else {
        return error('Expected property or type', lines, no)
      }

      if (number) rule[propname[0]].number = number[0].trim()

      if (match) {
        const m = { regex: match[1].trim() }

        if (message) {
          m.message = message
          message = null
        }

        if (!Array.isArray(rule[propname[0]])) {
          rule[propname[0]] = []
        }

        rule[propname[0]].push(m)
      }

      if (word) rule[propname[0]].word = word[0].trim()
      if (string) rule[propname[0]].string = string[0].trim()
      if (message) rule[propname[0]].message = message

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

    const def = matcher(tokens.define, no)

    if (def) {
      const name = def[0].trim()
      const path = matcher(tokens.path, no)

      if (!path) {
        return error('Type has no name', lines, no)
      }

      parentIsType = true
      parent = path[0]

      opath.set(tree.types, path, { name })
      continue
    }

    const word = matcher(tokens.word, no)

    if (word) {
      parentIsType = false

      const type = word[0]
      const path = matcher(tokens.path, no)

      if (!path) {
        return error('Rule has type but no property path or name', lines, no)
      }

      parent = path[0]

      opath.set(tree.rules, parent, {
        type,
        message: (message && message.trim()) || ''
      })

      continue
    }
  }
  return tree
}
