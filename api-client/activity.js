module.exports = Activity

function Activity (client) {
  if (!(this instanceof Activity)) return new Activity(client)
  this.client = client
}

Activity.prototype.get = function (key, options, cb) {
  return this.client.request('get', 'activity/' + key, options, cb)
}

Activity.prototype.list = function (options, cb) {
  return this.client.request('get', 'activity', options, cb)
}

Activity.prototype.put = function (options, cb) {
  return this.client.request('post', 'activity', options, cb)
}

Activity.prototype.delete = function (key, cb) {
  return this.client.request('delete', 'activity/' + key, {}, cb)
}