var Model = require('level-model')
var inherits = require('inherits')
var extend = require('extend')

module.exports = Comments
inherits(Comments, Model)

function Comments (db, options) {
  if (!(this instanceof Comments)) return new Comments(db, options)

  options = extend(options || {}, {
    modelName: 'comments',
    properties: {
      post: { type: 'string' },
      content: { type: 'string' },
      account: { type: 'string' },
      replyTo: { type: 'string' }
    },
    indexKeys: ['post', 'account', 'replyTo'],
    required: ['post', 'content', 'account']
  })

  Model.call(this, db, options)
}