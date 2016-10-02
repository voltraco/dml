# SYNOPSIS
Data models! Easy to read, easy to maintain.

# BUILD
[![Build Status](https://travis-ci.org/voltraco/node-models.svg)](https://travis-ci.org/voltraco/node-models)

# USAGE

### index.js
```js
const Models = require('node-models')

let v = Models.create(fs.readFileSync('sample.model', 'utf8'))
let result = v({
  id: 1337,
  created: new Date(),
  name: 'Glen Danzig'
})
```

### sample.model
```js
/*
 * An example data model
 */

Number id
Date created

String name {
  required true // this is required
  gt 2 "Must be greater than 2 characters"
  lte 256 "Must be less than or equal to 256 characters"
}

String bio "A bio must be a string" {
  lt 140 "A bio must fit into a tweet"
}
```

# LICENSE

https://voltra.co

[![License](https://img.shields.io/npm/l/array.from.svg)](/LICENSE)

