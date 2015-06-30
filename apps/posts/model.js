var Model = require('level-model')
var inherits = require('inherits')
var extend = require('extend')
var comments = require('../comments/model')

module.exports = Posts
inherits(Posts, Model)

function Posts (db, options) {
  if (!(this instanceof Posts)) return new Posts(db, options)

  options = extend(options || {}, {
    properties: {
      modelName: 'posts',
      title: { type: 'string' },
      url: { type: 'string' },
      slug: { type: 'string' },
      tags: { type: 'array' },
      account: { type: 'string' },
      media: { type: 'array' },
      metadata: { type: 'object' }
    },
    indexKeys: ['tags', 'slug', 'account'],
    required: ['title', 'url', 'account']
  })
  
  this.comments = comments(db)
  Model.call(this, db, options)
}

Posts.prototype.createCommentStream = function (key, options, cb) {
  return this.comments.find('post', key)
}