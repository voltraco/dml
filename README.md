# SYNOPSIS
Models backed by [`validimir`](https://github.com/juliangruber/validimir).
Define, validate and sanitize without any DSLs or schema languages.

# BUILD
[![Build Status](https://travis-ci.org/voltraco/node-models.png)](https://travis-ci.org/voltraco/node-models)

# USAGE
```js
const Models = require('node-models')

let v = Models.create({
  'beep.boop': Models.validators().string('boop must be a stirng').len(5),
  'foo.bar.bazz.quxx': Models.validators().number()
})

let data = { beep: { boop: 'k' }, foo: { bar: { bazz: { quxx: 100 } } }

let result = v(data)

if (result.length === 0) console.log('No errors!')
else console.log(result.errors)
```

### `Function` Models.create(`Object` object)
`create(object)` accepts an object with 
[`object paths`](https://github.com/mariocasciaro/object-path) for keys and
`validation functions` for values, returns a `validator` function.

```js
let v = Models.create({
  'beep.boop': Models.validators().string('boop must be a stirng').len(3)
})
```

### `Function` Models.validators([`Boolean` Optional]])
Returns a chainable set of validator functions via 
[`validimir`](https://github.com/juliangruber/validimir).

### `Object` validate(`Object` object[, `Boolean` sanitize])
The `validator` function only cares about property paths that are specified
in the model, that way you can be libeal with data and strict about specific
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

