# SYNOPSIS
Data models! Easy to read, compose and maintain.

# BUILD
[![Build Status](https://travis-ci.org/voltraco/node-models.svg)](https://travis-ci.org/voltraco/node-models)

# USAGE

### sample.model
Define a model using the modeling syntax

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
  lte 140 "A bio must fit into a tweet"
}

Boolean accountType
```

### index.js
Create an instance of the model then pass data into it one or more times.

```js
const Models = require('node-models')

let model = Models.compile(fs.readFileSync('sample.model', 'utf8'))

let result = model({
  id: 1337,
  created: new Date(),
  name: 'Glen Danzig',
  accountType: 'awesome'
})

console.log(result.data)
```

### output

The result will be an object that contains the final data, as well as a
`length` property which indicates how many rules were violated, and a rules
property containing information about the rules that were violated.

```js
{
  data: {
    id: 1337,
    created: '2016-10-02T13:56:44.931Z',
    name: 'Glen Danzig'
  },
  length: 1,
  rules: {
    accountType: [{
      validator: 'type',
      message: 'Expected type [Boolean] but got type [String]'
    }]
  }
}
```

# LICENSE

https://voltra.co

[![License](https://img.shields.io/npm/l/array.from.svg)](/LICENSE)

