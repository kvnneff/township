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
var marked = require('marked')
var filter = require('filter-object')
var st = require('st')

var handlebars = require('handlebars')
require('handlebars-layouts')(handlebars)
require('./handlebars-helpers')(handlebars)

var redirect = require('./redirect')

module.exports = Township

function Township (db, options) {
  if (!(this instanceof Township)) return new Township(db, options)
  options = options || { site: { title: 'Township', url: 'http://127.0.0.1:4243' } }
  var self = this

  this.db = db
  this.site = options.site

  this.accounts = accountdown(sublevel(db, 'accounts'), {
    login: { basic: require('accountdown-basic') }
  })

  this.auth = cookieAuth({
    name: options.site.title, 
    sessions: sublevel(this.db, 'sessions'),
    authenticator: function (req, res, cb) {
      parse(req, res, function (err, body) {
        self.accounts.verify('basic', body, function (err, ok, id) {
          if (err) return cb(err)
          if (!ok) return cb(new Error('incorrect password or username'))
          else cb()
        })
      })
    }
  })

  this.staticFileDir = options.staticFileDir || __dirname + '/../assets'
  this.staticFileUrl = options.staticFileUrl || '/assets/'

  mkdirp(this.staticFileDir, function (err) {
    if (err) console.error(err)
  })

  this.apps = options.apps || {}
}

Township.prototype.add = function (app) {
  this.apps[app.name] = app
}

Township.prototype.remove = function (name) {
  delete this.apps[app.name]
}

Township.prototype.getAccountBySession = function (req, cb) {
  var self = this

  this.auth.getSession(req, function (sessionError, session) {
    if (sessionError) return cb(sessionError)

    self.accounts.get(session.data.username, function (accountError, account) {
      if (accountError) return cb(accountError)
      if (!account) return cb(null, { active: false }, session)

      var accountFiltered = filter(account, '!email')
      accountFiltered.active = true
      return cb(null, accountFiltered, session)
    })
  })
}

Township.prototype.authorizeSession = function (req, res, cb) {
  this.getAccountBySession(req, function (err, account, session) {
    if (err) return cb(err)
    else cb(null, account, session)
  })
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
  if (req.headers.authorization) return this.authorizeAPI(req, cb)
  return this.authorizeSession(req, res, cb)
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
    for (app in self.apps) if (app.serve(req, res)) return

    self.getAccountBySession(req, function (err, account, session) {
      response().html(self.render('404', { account: account })).pipe(res)
    })
  })

  this._server.listen(this.port, cb)
}