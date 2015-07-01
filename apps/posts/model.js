var Model = require('level-model')
var inherits = require('inherits')
var extend = require('extend')
var comments = require('../comments/model')

module.exports = Posts
inherits(Posts, Model)

function Posts (db, options) {
  if (!(this instanceof Posts)) return new Posts(db, options)

  options = extend(options || {}, {
    modelName: 'posts',
    properties: {
      title: { type: ['string', 'null'], default: null },
      body: { type: ['string', 'null'], default: null },
      url: { type: ['string', 'null'], default: null },
      slug: { type: ['string', 'null'], default: null },
      tags: { type: 'array', default: [] },
      account: { type: ['string', 'null'], default: null },
      media: { type: 'array', default: [] },
      metadata: { type: 'object', default: {} }
    },
    indexKeys: ['tags', 'slug', 'account'],
    required: ['account']
  })

  this.comments = comments(db)
  Model.call(this, db, options)
}

Posts.prototype.createCommentStream = function (key, options, cb) {
  return this.comments.find('post', key)
}