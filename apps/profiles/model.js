var Model = require('level-model')
var inherits = require('inherits')
var extend = require('extend')
var comments = require('../comments/model')
//var accounts = require('../accounts/model')
//var sublevel = require('subleveldown')

module.exports = Profiles
inherits(Profiles, Model)

function Profiles (db, accounts, options) {
  if (!(this instanceof Profiles)) return new Profiles(db, accounts, options)

  options = extend(options || {}, {
    modelName: 'profiles',
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
  //this.accounts = accounts(db)
  this.accounts = accounts
  //this.accounts = accounts(sublevel(db, 'accounts'), {
  //  login: {basic: accountdownBasic }
  //})

  //var accountdown = require('accountdown')(sublevel(db, 'accounts'), {
  //  login: { basic: accountdownBasic }
  //})
  //
  //var accounts = require('accountdown-model')(accountdown, {
  //  db: db,
  //  properties: {
  //    username: { type: 'string' },
  //    email: { type: 'string' },
  //    profile: { type: 'string' }
  //  },
  //  required: ['username', 'email'],
  //  indexKeys: ['username', 'email', 'profile']
  //})

  Model.call(this, db, options)
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

//Profiles.prototype.beforeCreate = function (data) {
//  this.accounts.create(data)
//  return data
//}

//Profiles.prototype.get = function (key, unblockedKey,  cb) {
//  this.accounts.findOne(key)
//}

//Profiles.prototype.put = function (key, unblockedKey,  cb) {
//  var self = this
//  this.get(key, function (err, active) {
//    if (err) return cb(err)
//    delete active.blocked[unblockedKey]
//    self.update(key, active, function (err) {
//      if (err) return cb(err)
//      cb()
//    })
//  })
//}
