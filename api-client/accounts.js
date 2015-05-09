module.exports = Accounts

function Accounts (client) {
  if (!(this instanceof Accounts)) return new Accounts(client)
  this.client = client
}

Accounts.prototype.get = function (username, opts, cb) {
  return this.client.request('get', 'accounts/' + username, opts, cb)
}

Accounts.prototype.list = function (opts, cb) {
  return this.client.request('get', 'accounts', opts, cb)
}

Accounts.prototype.create = function (opts, cb) {
  return this.client.request('post', 'accounts', opts, cb)
}

Accounts.prototype.update = function (username, opts, cb) {
  return this.client.request('put', 'accounts/' + username, opts, cb)
}

Accounts.prototype.delete = function (username, cb) {
  return this.client.request('delete', 'accounts/' + username, {}, cb)
}