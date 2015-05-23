var Emitter = require('events').EventEmitter
var sublevel = require('subleveldown')
var inherits = require('util').inherits
var cuid = require('cuid')

module.exports = Profiles
inherits(Profiles, Emitter)

function Profiles (db, opts) {
  
}

Profiles.prototype.create = function (key, data, cb) {
  
}

Profiles.prototype.get = function (key, opts, cb) {
  
}

Profiles.prototype.update = function (key, data, cb) {
  
}

Profiles.prototype.delete = function (key, data, cb) {
  
}

Profiles.prototype.find = function (key, data, cb) {
  
}

Profiles.prototype.createReadStream = function (key, data, cb) {
  
}

Profiles.prototype.format = function (data) {
  if (!data.key) return new Error('key property required')
  if (!data.account) return new Error('account property required')
  if (!data.email) return new Error('email property required')

  return {
    key: data.key,
    account: data.account
    email: data.email,
    metadata: data.metadata || {}
  }
}