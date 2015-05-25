var fs = require('fs')
var path = require('path')
var http = require('http')
var extend = require('extend')
var cookieAuth = require('cookie-auth')
var accountdown = require('accountdown')
var sublevel = require('subleveldown')
var st = require('st')
var mkdirp = require('mkdirp')
var anyBody = require('body/any')
var Router = require('match-routes')
var response = require('response')
var marked = require('marked')
var filter = require('filter-object')

var handlebars = require('handlebars')
require('handlebars-layouts')(handlebars)
require('./handlebars-helpers')(handlebars)

var redirect = require('./redirect')

module.exports = WebApp

function WebApp (db, opts) {
  if (!(this instanceof WebApp)) return new WebApp(db, opts)
  opts = opts || { site: { title: 'Township', url: 'http://127.0.0.1:4243' } }
  var self = this

  this.db = db
  this.site = opts.site

  this.accounts = accountdown(sublevel(db, 'accounts'), {
    login: { basic: require('accountdown-basic') }
  })

  this.posts = require('./posts')(db)
  this.comments = require('./comments')(db)
  this.activity = require('./activity')(db, opts.site)
  this.profiles = require('./profiles')(db)

  this.auth = cookieAuth({
    name: opts.site.title, 
    sessions: sublevel(this.db, 'sessions'),
    authenticator: function (req, res, cb) {
      anyBody(req, res, function (err, body) {
        self.accounts.verify('basic', body, function (err, ok, id) {
          if (err) return cb(err)
          if (!ok) return cb(new Error('incorrect password or username'))
          else cb()
        })
      })
    }
  })

  this.staticFileDir = opts.staticFileDir || __dirname + '/../assets'
  this.staticFileUrl = opts.staticFileUrl || '/assets/'

  mkdirp(this.staticFileDir, function (err) {
    if (err) console.error(err)
  })

  this.views = {}
  this.viewsDir = path.join(__dirname, '/../views/')
  this.viewData = { site: opts.site }
  this.addViews()

  if (opts.views) {
    if (opts.views[opts.views.length - 1] !== '/')  opts.views += '/'
    this.viewsOverrideDir = opts.views
    this.overrideViews()
  }


  /*
  * Initialize router
  */

  this.router = Router()


  /*
  * Set up routes
  */

  require('../routes/accounts')(this)
  require('../routes/accounts-api-v1.0')(this)
  require('../routes/activity-api-v1.0')(this)
  require('../routes/posts-api-v1.0')(this)
  //require('../routes/comments-api-v1.0')(this)
  require('../routes/profiles-api-v1.0')(this)
  require('../routes/index')(this)
}

WebApp.prototype.getAccountBySession = function (req, cb) {
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

WebApp.prototype.authorizeSession = function (req, res, cb) {
  this.getAccountBySession(req, function (err, account, session) {
    if (err) return cb(err)
    else cb(null, account, session)
  })
}

WebApp.prototype.authorizeAPI = function (req, cb) {
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

WebApp.prototype.authorize = function (req, res, cb) {
  if (req.headers.authorization) return this.authorizeAPI(req, cb);
  return this.authorizeSession(req, res, cb)
};

WebApp.prototype.render = function (view, data) {
  var data = extend(data || {}, this.viewData)
  return this.views[view](data)
}

WebApp.prototype.addViews = function () {
  var self = this

  fs.readdir(this.viewsDir, function (err, files) {
    files.forEach(function (file) {
      if (file === 'layout.html') {
        var filepath = self.viewsDir + 'layout.html'
        handlebars.registerPartial('layout', fs.readFileSync(filepath, 'utf8'))
      }
      else self.addView(file)
    })
  })
}

WebApp.prototype.addView = function (file, viewsDir) {
  var dir = viewsDir || this.viewsDir
  return this.views[file.split('.')[0]] = this.compileView(dir + file)
}

WebApp.prototype.compileView = function (filepath) {
  var template = handlebars.compile(fs.readFileSync(filepath, 'utf8'))
  return template
}

WebApp.prototype.overrideViews = function () {
  var self = this

  fs.readdir(this.viewsOverrideDir, function (err, files) {
    files.forEach(function (file) {
      if (file === 'layout.html') {
        var filepath = self.viewsOverrideDir + 'layout.html'
        handlebars.registerPartial('layout', fs.readFileSync(filepath, 'utf8'))
      }
      else self.addView(file, self.viewsOverrideDir)
    })
  })
}

WebApp.prototype.listen = function (port, cb) {
  this.port = port || (process.env.NODE_ENV === 'production' ? 80 : 4243)
  var staticFiles = st({ path: this.staticFileDir, url: this.staticFileUrl })
  var self = this

  var cb = cb || function () {
    console.log('server listening at http://127.0.0.1:' + self.port)
  }

  this._server = http.createServer(function (req, res) {
    if (staticFiles(req, res)) return
    if (self.router.match(req, res)) return
    
    else {
      self.getAccountBySession(req, function (err, account, session) {
        response().html(self.render('404', { account: account })).pipe(res)
      })
    }
  })

  this._server.listen(this.port, cb)
}