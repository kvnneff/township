var Emitter = require('events').EventEmitter
var sublevel = require('subleveldown')
var inherits = require('util').inherits
var cuid = require('cuid')

var timestamp = require('./timestamp')
var indexer = require('./indexer')
var comments = require('./comments')
var list = require('./stream-utils/list')
var filter = require('./stream-utils/filter')

module.exports = Profiles
inherits(Profiles, Emitter)

function Profiles (db, opts) {
  if (!(this instanceof Profiles)) return new Profiles(db, opts)
  opts = opts || {}
  var self = this
  EventEmitter.call(this)
  this.db = sub(db, 'posts', { valueEncoding: 'json' })

  this.indexer = indexer(sublevel(db, 'profiles-index'), {
    properties: ['account'],
    map: function (key, cb) {
      self.get(key, function (err, val) {
        cb(err, val)
      })
    }
  })
}

Profiles.prototype.create = function (key, data, cb) {
  var self = this

  if (typeof key === 'object') {
    cb = data
    data = key
  }

  if (!data.key || key) {
    key = data.key = cuid()
  }

  data = this.format(data)
  if (data instanceof Error) return cb(data)

  this.db.put(key, data, function (err) {
    if (err) return cb(err)

    self.indexer.addIndexes(data, function () {
      self.emit('create', data)
      cb(null, data)
    })
  })
}

Profiles.prototype.get = function (key, options, cb) {
  this.db.get(key, options, cb)
}

Profiles.prototype.update = function (key, data, cb) {
  var self = this

  if (typeof key === 'object') {
    cb = data
    data = key
    key = data.key
  }

  this.get(key, function (err, profile) {
    if (err || !profile) return cb(new Error('Profile not found with key ' + key))
    var post = extend(profile, data)
    profile.updated = timestamp()
    self.indexer.updateIndexes(profile, function () {
      self.db.put(key, profile, function (err) {
        self.emit('update', profile)
        cb(err, profile)
      });
    })
  })
}

Profiles.prototype.delete = function (key, data, cb) {
  var self = this

  this.get(key, function (err, data) {
    if (err || !post) return cb(err)

    self.indexer.removeIndexes(data, function () {
      self.emit('delete', data)
      self.db.del(key, cb);
    })
  })
}

Profiles.prototype.list = function (options, callback) {
  return list.bind(this, options, cb)()
}

Profiles.prototype.find =
Profiles.prototype.createFindStream = function (index, key, options) {
  return this.indexer.find(index, key, options)
}

Profiles.prototype.filter =
Profiles.prototype.createFilterStream = function (query, options) {
  return this.createReadStream(options).pipe(through.obj(filter(query)))
}

Profiles.prototype.read = 
Profiles.prototype.createReadStream = function (options) {
  return this.db.createReadStream(options)
}

Profiles.prototype.format = function (data) {
  if (!data.key) return new Error('key property required')
  if (!data.account) return new Error('account property required')
  if (!data.email) return new Error('email property required')

  return {
    key: data.key,
    account: data.account
    email: data.email,
    following: data.following || [],
    followers: data.followers || [],
    private: data.private || false,
    created: doc.created || timestamp(),
    updated: doc.updated || null,
    metadata: data.metadata || {}
  }
}