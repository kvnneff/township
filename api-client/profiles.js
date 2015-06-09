module.exports = Profiles

function Profiles (client) {
  if (!(this instanceof Profiles)) return new Profiles(client)
  this.client = client
}

Profiles.prototype.get = function (key, options, cb) {
  return this.client.request('get', 'profiles/' + key, options, cb)
}

Profiles.prototype.list = function (options, cb) {
  return this.client.request('get', 'profiles', options, cb)
}

Profiles.prototype.create = function (options, cb) {
  return this.client.request('post', 'profiles', options, cb)
}

Profiles.prototype.update = function (key, options, cb) {
  if (typeof key === 'object') {
    cb = options
    options = key
    key = options.key
  }
  return this.client.request('put', 'profiles/' + key, options, cb)
}

Profiles.prototype.delete = function (key, cb) {
  return this.client.request('delete', 'profiles/' + key, {}, cb)
}