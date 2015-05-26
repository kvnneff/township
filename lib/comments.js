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
var list = require('./stream-utils/list')
var filter = require('./stream-utils/filter')

module.exports = Comments
inherits(Comments, EventEmitter)

function Comments (db, opts) {
  if (!(this instanceof Comments)) return new Comments(db, opts)
  opts = opts || {}
  var self = this
  EventEmitter.call(this)
  this.db = sub(db, 'comments', { valueEncoding: 'json' })

  this.indexer = indexer(sub(db, 'comments-index'), {
    properties: ['post', 'account', 'replyTo'],
    map: function (key, cb) {
      self.get(key, function (err, val) {
        cb(err, val)
      })
    }
  })
}

Comments.prototype.create = function (key, val, cb) {
  var self = this

  if (typeof key === 'object') {
    cb = val
    val = key
  }

  if (!val.key || key) {
    key = val.key = cuid()
  }

  val = this.format(val)
  if (val instanceof Error) return cb(val)

  this.db.put(key, val, function (err) {
    if (err) return cb(err)

    self.indexer.addIndexes(val, function () {
      self.emit('create', val)
      cb(null, val)
    })
  })
}

Comments.prototype.get = function (key, opts, cb) {
  this.db.get(key, opts, cb)
}

Comments.prototype.update = function (key, data, cb) {
  var self = this

  if (typeof key === 'object') {
    cb = data
    data = key
    key = data.key
  }

  this.get(key, function (err, comment) {
    if (err) return cb(err)
    var comment = extend(comment, data)
    comment.updated = timestamp()
    self.indexer.updateIndexes(comment, function () {
      self.db.put(key, comment, function (err) {
        self.emit('update', comment)
        cb(err, comment)
      });
    })
  })
}

Comments.prototype.delete = function (key, cb) {
  var self = this

  this.get(key, function (err, comment) {
    if (err || !comment) return cb(new Error('Post not found with key ' + key))

    self.indexer.removeIndexes(comment, function () {
      self.emit('delete', comment)
      self.db.del(key, cb);
    })
  })
}

Comments.prototype.read =
Comments.prototype.createReadStream = function (opts) {
  return this.db.createReadStream(opts)
}

Comments.prototype.find =
Comments.prototype.createFindStream = function (index, opts) {
  return this.indexer.find(index, opts)
}

Comments.prototype.filter = 
Comments.prototype.createFilterStream = function (options) {
  return this.createReadStream(options).pipe(through.obj(filter(options.query)))
}

Comments.prototype.list = function (opts, cb) {
  return list.bind(this, opts, cb)()
}

Comments.prototype.format = function (doc) {
  if (!doc.key) return new Error('key property required')
  if (!doc.post) return new Error('post property required')
  if (!doc.content) return new Error('content property required')
  if (!doc.account) return new Error('account property required')

  if (typeof doc.post === 'object') doc.post = doc.post.key

  return {
    key: doc.key,
    post: doc.post,
    content: doc.content,
    account: doc.account,
    replyTo: doc.replyTo || null
  }
}
