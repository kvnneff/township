var qs = require('querystring')
var request = require('request')


/*
* Replace TownshipClient with name of your app
*/

module.exports = TownshipClient

function TownshipClient (options) {
  if (!(this instanceof TownshipClient)) return new TownshipClient(options)

  options = options || {}

  this.account = {
    username: options.username,
    password: options.password
  }

  this.host = options.host || 'https://127.0.0.1:4243'
  this.apiVersion = options.apiVersion || '/v1.0/'

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
  
  var options = {}

  if (method === 'get') {
    params = qs.stringify(params)
    options.uri = this.fullUrl(path, params)
  }

  else {
    options.uri = this.fullUrl(path)
    options.body = params
  }

  options.json = true
  options.method = method
  options.headers = {
    'Authorization': this.account.username + ':' + this.account.password
  }

  if (typeof cb === 'undefined') return request(options)
  else request(options, getResponse)

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