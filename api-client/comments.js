module.exports = Comments

function Comments (client) {
  if (!(this instanceof Comments)) return new Comments(client)
  this.client = client
}

Comments.prototype.get = function (key, opts, cb) {
  return this.client.request('get', 'comments/' + key, opts, cb)
}

Comments.prototype.list = function (opts, cb) {
  return this.client.request('get', 'comments', opts, cb)
}

Comments.prototype.create = function (opts, cb) {
  return this.client.request('post', 'comments', opts, cb)
}

Comments.prototype.update = function (key, opts, cb) {
  if (typeof key === 'object') {
    cb = opts
    opts = key
    key = opts.key
  }
  return this.client.request('put', 'comments/' + key, opts, cb)
}

Comments.prototype.delete = function (key, cb) {
  return this.client.request('delete', 'comments/' + key, {}, cb)
}