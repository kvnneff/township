module.exports = Activity

function Activity (client) {
  if (!(this instanceof Activity)) return new Activity(client)
  this.client = client
}

Activity.prototype.get = function (key, opts, cb) {
  return this.client.request('get', 'activity/' + key, opts, cb)
}

Activity.prototype.list = function (opts, cb) {
  return this.client.request('get', 'activity', opts, cb)
}

Activity.prototype.put = function (opts, cb) {
  return this.client.request('post', 'activity', opts, cb)
}

Activity.prototype.delete = function (key, cb) {
  return this.client.request('delete', 'activity/' + key, {}, cb)
}