module.exports = Posts

function Posts (client) {
  if (!(this instanceof Posts)) return new Posts(client)
  this.client = client
}

Posts.prototype.get = function (key, options, cb) {
  return this.client.request('get', 'posts/' + key, options, cb)
}

Posts.prototype.list = function (options, cb) {
  return this.client.request('get', 'posts', options, cb)
}

Posts.prototype.create = function (options, cb) {
  return this.client.request('post', 'posts', options, cb)
}

Posts.prototype.update = function (key, options, cb) {
  if (typeof key === 'object') {
    cb = options
    options = key
    key = options.key
  }
  return this.client.request('put', 'posts/' + key, options, cb)
}

Posts.prototype.delete = function (key, cb) {
  return this.client.request('delete', 'posts/' + key, {}, cb)
}