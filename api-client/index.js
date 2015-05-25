var qs = require('querystring')
var request = require('request')


/*
* Replace TownshipClient with name of your app
*/

module.exports = TownshipClient

function TownshipClient (opts) {
  if (!(this instanceof TownshipClient)) return new TownshipClient(opts)

  opts = opts || {}

  this.account = {
    username: opts.username,
    password: opts.password
  }

  this.host = opts.host || 'https://127.0.0.1:4243'
  this.apiVersion = opts.apiVersion || '/v1.0/'

  this.accounts = require('./accounts')(this)
  this.activity = require('./activity')(this)
  this.profiles = require('./profiles')(this)
  this.posts = require('./posts')(this)
  this.comments = require('./comments')(this)
}

TownshipClient.prototype.request = function (method, path, params, cb) {
  if (typeof params === 'function') {
    cb = params
    params = {}
  }
  
  var opts = {}

  if (method === 'get') {
    params = qs.stringify(params)
    opts.uri = this.fullUrl(path, params)
  }

  else {
    opts.uri = this.fullUrl(path)
    opts.body = params
  }

  opts.json = true
  opts.method = method
  opts.headers = {
    'Authorization': this.account.username + ':' + this.account.password
  }

  if (typeof cb === 'undefined') return request(opts)
  else request(opts, getResponse)

  function getResponse (error, response, body) {
    if (cb) {
      if (error) return cb(error)
      if (response.statusCode >= 400) return cb({ error: { status: response.statusCode } })
      return cb(null, body)
    }
  }  
}

TownshipClient.prototype.fullUrl = function fullUrl (path, params) {
  var url = this.host + '/api' + this.apiVersion + path + '/'
  if (params) url += '?' + params
  return url
}