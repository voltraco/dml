# SYNOPSIS
Models backed by [`validimir`](https://github.com/juliangruber/validimir).
Define, validate and sanitize without any DSLs or schema languages.

# BUILD
[![Build Status](https://travis-ci.org/voltraco/node-models.svg)](https://travis-ci.org/voltraco/node-models)

# USAGE
```js
const Models = require('node-models')

let v = Models.create({
  'beep.boop': Models.validators().string('boop must be a string').len(5),
  'foo.bar.bazz.quxx': Models.validators().number()
})

let data = { beep: { boop: 'k' }, foo: { bar: { bazz: { quxx: 100 } } }

let result = v(data)

if (result.length === 0) console.log('No errors!')
else console.log(result.errors)
```

### `Function` Models.create(`Object` obj [, `Object` model, ...])
`create(object)` accepts an object with 
[`object paths`](https://github.com/mariocasciaro/object-path) for keys and
`validation functions` for values, returns a `validator` function. It can
also be extended with other models by passing them in as additional arguments.

```js
let v = Models.create({
  'beep.boop': Models.validators().string('boop must be a stirng').len(3)
})
```

### `Function` Models.validators([`Boolean` optional]])
Returns a chainable set of validator functions via 
[`validimir`](https://github.com/juliangruber/validimir). Validators cover
a good number of use cases, here are a few examples...

```js
// an item is in an array
Models.validators().of(['foo', 'bar'])('foo')

// a custom pattern match
Models.validators().match(/\d/, 'A password must contain at least one number')

// a range
Models.validators().len({ gt: 3, lte: 10 })('a')
```

### `Object` validate(`Object` object[, `Boolean` sanitize])
The `validator` function only cares about property paths that are specified
in the model, that way you can be liberal with data and strict about specific
details. You can also pass a bool as the second parameter which will remove
any properties that have not been specified in the model.

```js
let data = { beep: { boop: 'bla' }, bla: 100 }
let result = v(data)

if (result.length === 0) console.log('No errors!')
else console.log(result.errors)
```

When there are errors, they will be detailed, for example...

```js
let v = Models.create({
  'beep.boop': Models.validators().string('boop must be a stirng').len(5)
})

let data = { beep: { boop: 'k' }, bla: 100 }

console.log(v(data))
```

```json
{ "beep.boop":
   [ { "value": "k",
       "operator": "len",
       "expected": 5,
       "actual": 1,
       "message": "Expected 'k' to have length 5" } ],
  "length": 1 }
```

# LICENSE

https://voltra.co

[![License](https://img.shields.io/npm/l/array.from.svg)](/LICENSE)

