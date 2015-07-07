var fs = require('fs')
var path = require('path')
var http = require('http')
var extend = require('extend')
var cookieAuth = require('cookie-auth')
var accountdown = require('accountdown')
var sublevel = require('subleveldown')
var mkdirp = require('mkdirp')
var parse = require('body/any')
var Router = require('match-routes')
var response = require('response')
var filter = require('filter-object')
var st = require('st')

var redirect = require('./redirect')

module.exports = Township

function Township (db, options) {
  if (!(this instanceof Township)) return new Township(db, options)
  options = options || {}
  var self = this

  this.db = db
  this.site = options.site || { title: 'Township', url: 'http://127.0.0.1:4243' }

  this.staticFileDir = options.staticFileDir || __dirname + '/../assets'
  this.staticFileUrl = options.staticFileUrl || '/assets/'

  mkdirp(this.staticFileDir, function (err) {
    if (err) console.error(err)
  })

  this.apps = {}

  if (options.apps) {
    for (app in options.apps) {
      this.add(options.apps[app])
    }
  }

  this.add(require('../apps/schema')(this))
}

Township.prototype.add = function (app) {
  app = app(this)
  this.apps[app.name] = app
}

Township.prototype.remove = function (name) {
  delete this.apps[app.name]
}

Township.prototype.schema = function () {
  var schema = {}
  for (app in this.apps) {
    if (this.apps[app].schema) {
      schema[app] = this.apps[app].schema
      schema[app].href = this.site.url + '/api/v1/' + app
    }
  }
  return schema
}

Township.prototype.authorizeAPI = function (req, cb) {
  var self = this

  if (!req.headers.authorization) return cb('Unauthorized')

  var cred = req.headers.authorization.split(':')
  var account = { username: cred[0], password: cred[1] }

  self.accounts.verify('basic', account, function (err, ok, id) {
    if (err) return cb(err)
    if (!ok) return cb(new Error('incorrect password or username'))

    self.accounts.get(id, function (accountError, account) {
      if (accountError) return cb(accountError)
      var accountFiltered = filter(account, '!email')
      cb(null, accountFiltered)
    })
  })
}

Township.prototype.authorize = function (req, res, cb) {
  return this.authorizeAPI(req, cb)
}

Township.prototype.listen = function (port, cb) {
  this.port = port || (process.env.NODE_ENV === 'production' ? 80 : 4243)
  var staticFiles = st({ path: this.staticFileDir, url: this.staticFileUrl })
  var self = this

  var cb = cb || function () {
    console.log('server listening at http://127.0.0.1:' + self.port)
  }

  this._server = http.createServer(function (req, res) {
    if (staticFiles(req, res)) return

    for (app in self.apps) {
      if (self.apps[app].serve(req, res)) return
    }

    response().json({ error: '404' }).pipe(res)
  })

  this._server.listen(this.port, cb)
}
