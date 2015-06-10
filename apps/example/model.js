var Model = require('level-model')
var inherits = require('inherits')
var extend = require('extend')

module.exports = Example
inherits(Example, Model)

function Example (db, options) {
  if (!(this instanceof Example)) return new Example(db, options)

  options = extend(options || {}, {
    properties: {
      title: { type: 'string' },
      content: { type: 'string' },
      tags: { type: 'array' }
    },
    indexKeys: ['tags'],
    required: []
  })

  Model.call(this, db, options)

  // creating an object so we can request it later in the browser
  // just as an example
  this.put({
    title: 'example',
    content: 'an example model',
    tags: ['example']
  }, function (err) {
    if (err) throw err
  })
}