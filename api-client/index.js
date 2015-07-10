var qs = require('querystring')
var request = require('request')
var Upload = require('component-upload')

/*
* Replace TownshipClient with name of your app
*/

module.exports = TownshipClient

function TownshipClient (options) {
  if (!(this instanceof TownshipClient)) return new TownshipClient(options)
  options = options || {}

  if (options.username && options.password) {
    this.account = {
      username: options.username,
      password: options.password
    }
  }

  this.host = options.host || 'https://127.0.0.1:4243'
  this.apiVersion = options.apiVersion || '/v1/'

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
    options.json = true
  }

  else {
    options.uri = this.fullUrl(path)
    options.json = options.body = params
  }

  options.method = method

  if (this.account) {
    options.headers = {
      'Authorization': this.account.username + ':' + this.account.password
    }
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

/**
 * Upload File objects taken from a FileList
 * @param  {String}   method Must be either `POST` (default) or `PUT`
 * @param  {String}   path   Path to upload endpoint
 * @param  {Object}   params Parameters object
 * @param  {Array}    params.files Array of File objects
 * @param  {Function} cb     Callback
 */
TownshipClient.prototype.upload = function upload (method, path, params, cb) {
  var filesLength = params.files.length
  var url = this.fullUrl(path)
  var completedFiles = []

  function done() {
    return cb(null, completedFiles)
  }

  params.files.forEach(function (file) {
    var upload = Upload(file)

    upload.on('err', function (err) {
      return cb(err)
    })

    upload.on('end', function (response) {
      if (response.statusCode >= 400) return cb({error: { status: response.statusCode } })
      completedFiles.push(JSON.parse(response.responseText)[0])
      if (completedFiles.length === filesLength) return done()
    })

    upload.to(url)
  })
}