module.exports = Comments

function Comments (client) {
  if (!(this instanceof Comments)) return new Comments(client)
  this.client = client
}

Comments.prototype.get = function (key, options, cb) {
  return this.client.request('get', 'comments/' + key, options, cb)
}

Comments.prototype.list = function (options, cb) {
  return this.client.request('get', 'comments', options, cb)
}

Comments.prototype.create = function (options, cb) {
  return this.client.request('post', 'comments', options, cb)
}

Comments.prototype.update = function (key, options, cb) {
  if (typeof key === 'object') {
    cb = options
    options = key
    key = options.key
  }
  return this.client.request('put', 'comments/' + key, options, cb)
}

Comments.prototype.delete = function (key, cb) {
  return this.client.request('delete', 'comments/' + key, {}, cb)
}