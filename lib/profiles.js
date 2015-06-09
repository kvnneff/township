var Model = require('level-model')
var inherits = require('inherits')
var extend = require('extend')
var comments = require('./comments')

module.exports = Profiles
inherits(Profiles, Model)

function Profiles (db, options) {
  if (!(this instanceof Profiles)) return new Profiles(db, options)

  options = extend(options || {}, {
    properties: {
      account: { type: 'string' },
      username: { type: 'string' },
      email: { type: 'string' },
      following: { type: 'object' },
      followers: { type: 'object' },
      blocked: { type: 'object' },
      private: { type: 'boolean' },
      metadata: { type: 'object' }
    },
    indexKeys: ['account', 'username', 'email'],
    required: ['account', 'username', 'email']
  })

  this.comments = comments(db)
  Model.call(this, db, options)
}

Profiles.prototype.format = function (data) {
  if (!data.key) return new Error('key property required')
  if (!data.account) return new Error('account property required')
  if (!data.username) return new Error('username property required')
  if (!data.email) return new Error('email property required')

  return {
    key: data.key,
    account: data.account,
    username: data.username,
    email: data.email,
    following: data.following || {},
    followers: data.followers || {},
    blocked: data.blocked || {},
    private: data.private || false,
    created: data.created || timestamp(),
    updated: data.updated || null,
    metadata: data.metadata || {}
  }
}

Profiles.prototype.delete = function (key, cb) {
  var self = this
  this.get(key, function (err, data) {
    if (err || !data) return cb(err)
    self.indexer.removeIndexes(data, function () {
      self.emit('delete', data)
      self.db.del(key, cb);
    })
  })
}

Profiles.prototype.follow = function (key, followKey,  cb) {
  var self = this
  this.get(key, function (err, active) {
    active.following[followKey] = true
    self.update(key, data, function (err, active) {
      self.get(followKey, function (err, follow) {
        follow.follwers[key] = true
        self.update(followKey, follow, function (err, follow) {
          cb(err)
        })
      })
    })
  })
}

Profiles.prototype.unfollow = function (key, unfollowKey,  cb) {
  var self = this
  this.get(key, function (err, active) {
    if (err) return cb(err)
    delete active.following[unfollowKey]
    self.update(key, active, function (err) {
      if (err) return cb(err)
      self.get(unfollowKey, function (err, unfollow) {
        if (err) return cb(err)
        delete unfollow.followers[key]
        self.update(unfollowKey, function (err) {
          if (err) return cb(err)
          cb()
        })
      })
    })
  })
}

Profiles.prototype.block = function (key, blockedKey,  cb) {
  var self = this
  this.get(key, function (err, active) {
    if (err) return cb(err)
    active.blocked[followKey] = true
    self.update(key, data, function (err, active) {
      if (err) return cb(err)
      cb()
    })
  })
}

Profiles.prototype.unblock = function (key, unblockedKey,  cb) {
  var self = this
  this.get(key, function (err, active) {
    if (err) return cb(err)
    delete active.blocked[unblockedKey]
    self.update(key, active, function (err) {
      if (err) return cb(err)
      cb()
    })
  })
}
