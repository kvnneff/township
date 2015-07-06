var extend = require('extend')
var response = require('response')
var JSONStream = require('JSONStream')
var jsonBody = require('body/json')
var through = require('through2')
var filter = require('filter-object')

var errorResponse = require('../../lib/error-response')
var tokens = require('../../lib/tokens')

module.exports = AccountsApiHandler

function AccountsApiHandler (accounts, options) {
  if (!(this instanceof AccountsApiHandler)) {
    return new AccountsApiHandler(accounts, options)
  }
  this.tokens = tokens(options.secret || 's3cr3t_Pa55w0rd')
  this.accounts = accounts
}

/*
 * GET: return all accounts
 * POST: create a new account (admins only)
 */
AccountsApiHandler.prototype.index = function (req, res) {
  var self = this
  var decoded = this.auth(req, res)

  /*
   *  Get list of accounts
   */

  if (req.method === 'GET') {
    return self.accounts.createReadStream({keys: false})
      .pipe(filterAccountDetails())
      .pipe(JSONStream.stringify())
      .pipe(res)
  }

  /*
   *  Create a new account
   */

  else if (req.method === 'POST') {
    if (!decoded.admin) return errorResponse(res, 401,'Must be admin to create new accounts')
    jsonBody(req, res, function (err, body) {
      if (err) return errorResponse(res, 500, err)
      var opts = {
        login: { basic: { key: body.key, password: body.password } },
        value: filter(body, '!password')
      }

      self.accounts.create(body.key, opts, function (err) {
        if (err) return errorResponse(res, 500, 'Unable to create new user' + err)

        self.accounts.get(body.key, function (err, account) {
          if (err) return errorResponse(res, 500, 'Server error' + err)

          return response().status(200).json(account).pipe(res)
        })
      })
    })
  }
  else return errorResponse(res, 405, 'request method not recognized: ' + req.method )
  //})
}

/*
 * GET: return an account
 * PUT: update an account (admins only)
 * DELETE: remove an account (admins only)
 */
AccountsApiHandler.prototype.item = function (req, res, opts) {
  var self = this
  var decoded = this.auth(req, res)

  /*
   *  Get individual account
   */

  if (req.method === 'GET') {
    self.accounts.get(opts.params.key, function (err, account) {
      if (err) return errorResponse(res, 500, 'Could not retrieve the account')
      if (!decoded.admin) account = filter(account, ['*', '!email', '!admin'])
      return response().status(200).json(account).pipe(res)
    })
  }

  /*
   *  Update an account
   */

  else if (req.method === 'PUT') {
    if (!decoded.admin) return errorResponse(res, 401, 'Must be admin to update accounts')
    jsonBody(req, res, opts, function (err, body) {
      if (err) return errorResponse(res, 500, 'Could not parse the request\'s body' )
      self.accounts.get(opts.params.key, function (err, account){
        if (err) return errorResponse(res, 500, 'Could not retrieve account:' + err )
        account = extend(account, body)
        self.accounts.put(opts.params.key, account, function (err) {
          if (err) return errorResponse(res, 500, 'Server error' )
          response().status(200).json(account).pipe(res)
        })
      })
    })
  }

  /*
   *  Delete an account
   */

  else if (req.method === 'DELETE') {
    if (!decoded.admin) return errorResponse(res, 401, 'Must be admin to delete accounts')
    self.accounts.remove(opts.params.key, function (err) {
      if (err) return errorResponse(res, 500, 'Key does not exist' )
      return response().json(opts.params).pipe(res)
    })
  }

  else return errorResponse(res, 405, 'request method not recognized: ' + req.method )


}

AccountsApiHandler.prototype.auth = function (req, res) {
  var decoded
  try {
    decoded = this.tokens.verify(req)
  } catch(e) {
    if (e.name === 'JsonWebTokenError') return errorResponse(res, 401, 'Error verifying web token' + err.message)
    else throw e
  }
  if (!decoded) return errorResponse(res, 401, 'Not authorized')
  return decoded
}

AccountsApiHandler.prototype.authItem = function (req, res, opts) {

}
/*
 * Helper functions
 */

function filterAccountDetails () {
  return through.obj(function iterator(chunk, enc, next) {
    this.push(filter(chunk, ['*', '!email', '!admin']))
    next()
  })
}
