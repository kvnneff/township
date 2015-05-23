module.exports = Posts

function Posts (client) {
  if (!(this instanceof Posts)) return new Posts(client)
  this.client = client
}

Posts.prototype.get = function (key, opts, cb) {
  return this.client.request('get', 'posts/' + key, opts, cb)
}

Posts.prototype.list = function (opts, cb) {
  return this.client.request('get', 'posts', opts, cb)
}

Posts.prototype.create = function (opts, cb) {
  return this.client.request('post', 'posts', opts, cb)
}

Posts.prototype.update = function (key, opts, cb) {
  if (typeof key === 'object') {
    cb = opts
    opts = key
    key = opts.key
  }
  return this.client.request('put', 'posts/' + key, opts, cb)
}

Posts.prototype.delete = function (key, cb) {
  return this.client.request('delete', 'posts/' + key, {}, cb)
}