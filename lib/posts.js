var EventEmitter = require('events').EventEmitter
var inherits = require('util').inherits
var collect = require('stream-collector')
var through = require('through2')
var sub = require('subleveldown')
var inherits = require('inherits')
var format = require('json-format-stream')
var extend = require('extend')
var each = require('each-async')
var moment = require('moment')
var slugify = require('slug')
var clone = require('clone')
var cuid = require('cuid')

var timestamp = require('./timestamp')
var indexer = require('./indexer')
var comments = require('./comments')

module.exports = Posts
inherits(Posts, EventEmitter)

function Posts (db, opts) {
  if (!(this instanceof Posts)) return new Posts(db, opts)
  opts = opts || {}
  var self = this
  EventEmitter.call(this)
  this.db = sub(db, 'posts', { valueEncoding: 'json' })

  this.comments = comments(db)

  this.indexer = indexer(sub(db, 'posts-index'), {
    properties: ['tags', 'slug', 'account'],
    map: function (key, cb) {
      self.get(key, function (err, val) {
        cb(err, val)
      })
    }
  })
}

Posts.prototype.create = function (key, val, cb) {
  var self = this

  if (typeof key === 'object') {
    cb = val
    val = key
  }
  
  if (!val.key || key) {
    key = val.key = cuid()
  }

  val = this.createPost(val)
  if (val instanceof Error) return cb(val)

  this.db.put(key, val, function (err) {
    if (err) return cb(err)

    self.indexer.addIndexes(val, function () {
      self.emit('create', val)
      
      if (val.comments) {
        each(val.comments, function (comment, i, next) {
          comment.post = val.key
          self.comments.create(comment, function (err, res) {
            val.comments[i] = res
            next()
          })
        }, function () {
          cb(null, val)
        })
      }
      
      cb(null, val)
    })
  })
}

Posts.prototype.get = function (key, opts, cb) {
  this.db.get(key, opts, cb)
}

Posts.prototype.update = function (key, data, cb) {
  var self = this

  if (typeof key === 'object') {
    cb = data
    data = key
    key = data.key
  }

  this.get(key, function (err, post) {
    if (err || !post) return cb(new Error('Post not found with key ' + key))
    var post = extend(post, data)
    post.updated = timestamp()
    self.indexer.updateIndexes(post, function () {
      self.db.put(key, post, function (err) {
        self.emit('update', post)
        cb(err, post)
      });
    })
  })
}

Posts.prototype.delete = function (key, cb) {
  var self = this

  this.get(key, function (err, post) {
    if (err || !post) return cb(err)

    self.indexer.removeIndexes(post, function () {
      self.emit('delete', post)
      self.db.del(key, cb);
    })
  })
}

Posts.prototype.list = function (opts, cb) {
  var self = this
  opts = opts || {}

  if (typeof opts === 'function') {
    if (!cb) cb = opts
    var data = []

    opts = extend({ keys: false }, opts)
    opts.reverse = opts.reverse || true

    this.createReadStream(opts)
      .on('data', function (item) {
        data.push(item)
      })
      .on('end', function () {
        cb(null, data)
      })
  }

  else {
    opts = extend({ keys: false }, opts)
    return this.createReadStream(opts)
  }
}

Posts.prototype.find = function (index, key, opts) {
  return this.indexer.find(index, key, opts)
}

Posts.prototype.createReadStream = function (opts) {
  return this.db.createReadStream(opts)
}

Posts.prototype.createWriteStream = function (opts) {
  return this.db.createWriteStream(opts)
}

Posts.prototype.createCommentStream = function (key, opts, cb) {
  return this.comments.find('post', key)
}

Posts.prototype.createPost = function (doc) {
  if (!doc.key) return new Error('key required')
  if (!doc.title) return new Error('title required')
  if (!doc.url) return new Error('url required')
  if (!doc.account) return new Error('account required')

  var slug = doc.slug || slugify(doc.title).toLowerCase()

  return {
    key: doc.key,
    title: doc.title,
    url: doc.url,
    slug: slug,
    tags: doc.tags || [],
    account: doc.account,
    media: doc.media || {},
    metadata: doc.metadata || {}
  }
}
