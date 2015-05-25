module.exports = Profiles

function Profiles (client) {
  if (!(this instanceof Profiles)) return new Profiles(client)
  this.client = client
}

Profiles.prototype.get = function (key, opts, cb) {
  return this.client.request('get', 'profiles/' + key, opts, cb)
}

Profiles.prototype.list = function (opts, cb) {
  return this.client.request('get', 'profiles', opts, cb)
}

Profiles.prototype.create = function (opts, cb) {
  return this.client.request('post', 'profiles', opts, cb)
}

Profiles.prototype.update = function (key, opts, cb) {
  if (typeof key === 'object') {
    cb = opts
    opts = key
    key = opts.key
  }
  return this.client.request('put', 'profiles/' + key, opts, cb)
}

Profiles.prototype.delete = function (key, cb) {
  return this.client.request('delete', 'profiles/' + key, {}, cb)
}