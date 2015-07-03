//var qs = require('querystring')
//var response = require('response')
//var JSONStream = require('JSONStream')
//var jsonBody = require('body/json')
//var through = require('through2')
//var filter = require('filter-object')
//var extend = require('extend')
var extend = require('extend')
var response = require('response')
var JSONStream = require('JSONStream')
var jsonBody = require('body/json')
var through = require('through2')
var filter = require('filter-object')

var errorResponse = require('../../lib/error-response')

module.exports = AccountsApiHandler

function AccountsApiHandler (server) {
  if (!(this instanceof AccountsApiHandler)) {
    return new AccountsApiHandler(server)
  }
  this.server = server
  this.tokens = server.tokens
}

/*
 * GET: return all accounts
 * POST: create a new account (admins only)
 */
AccountsApiHandler.prototype.accounts = function (req, res) {
  var self = this
  this.tokens.verify(req, function(err, decoded) {
    if (err) return response().status(401).json({error: 'Error verifying web token' + err}).pipe(res)
    if (!decoded) return response().status(401).json({error: 'Not authorized'}).pipe(res)

    /*
     *  Get list of accounts
     */

    if (req.method === 'GET') {
      return self.server.accounts.list({keys: false})
        .pipe(filterAccountDetails())
        .pipe(JSONStream.stringify())
        .pipe(res)
    }

    /*
     *  Create a new account
     */

    else if (req.method === 'POST') {
      if (!decoded.admin) return response().status(401).json({error: 'Must be admin to create new accounts'}).pipe(res)
      jsonBody(req, res, function (err, body) {
        if (err) return response().status(500).json({ error: err }).pipe(res)
        var opts = {
          login: { basic: { key: body.key, password: body.password } },
          value: filter(body, '!password')
        }

        self.server.accounts.create(body.key, opts, function (err) {
          if (err) return response().status(500).json({ error: 'Unable to create new user' + err }).pipe(res)

          self.server.accounts.get(body.key, function (err, account) {
            if (err) return response().status(500).json({ error: 'Server error' + err }).pipe(res)

            return response().status(200).json(account).pipe(res)
          })
        })
      })
    }
    else return response().status(405).json({ error:'request method not recognized: ' + req.method }).pipe(res)
  })
}

/*
 * GET: return an account
 * PUT: update an account (admins only)
 * DELETE: remove an account (admins only)
 */
AccountsApiHandler.prototype.account = function (req, res, opts) {
  var self = this
  this.tokens.verify(req, function(err, decoded) {
    if (err) return response().status(401).json({error: 'Error verifying web token' + err}).pipe(res)
    if (!decoded) return response().status(401).json({error: 'Not authorized'}).pipe(res)

    /*
     *  Get individual account
     */

    if (req.method === 'GET') {
      self.server.accounts.get(opts.params.key, function (err, account) {
        if (err) return response().status(500).json({error: 'Could not retrieve the account'}).pipe(res)
        if (!decoded.admin) account = filter(account, ['*', '!email', '!admin'])
        return response().status(200).json(account).pipe(res)
      })
    }

    /*
     *  Update an account
     */

    else if (req.method === 'PUT') {
      if (!decoded.admin) return response().status(401).json({error: 'Must be admin to update accounts'}).pipe(res)
      jsonBody(req, res, opts, function (err, body) {
        if (err) return response().status(500).json({ error:'Could not parse the request\'s body' }).pipe(res)
        self.server.accounts.get(opts.params.key, function (err, account){
          if (err) return response().status(500).json({ error:'Could not retrieve account:' + err }).pipe(res)
          account = extend(account, body)
          self.server.accounts.put(opts.params.key, account, function (err) {
            if (err) return response().status(500).json({ error:'Server error' }).pipe(res)
            response().status(200).json(account).pipe(res)
          })
        })
      })
    }

    /*
     *  Delete an account
     */

    else if (req.method === 'DELETE') {
      if (!decoded.admin) return response().status(401).json({error: 'Must be admin to delete accounts'}).pipe(res)
      self.server.accounts.remove(opts.params.key, function (err) {
        if (err) return response().status(500).json({ error:'Key does not exist' }).pipe(res)
        return response().json(opts.params).pipe(res)
      })
    }

    else return response().status(405).json({ error:'request method not recognized: ' + req.method }).pipe(res)
  })
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
//var qs = require('querystring')
//var response = require('response')
//var JSONStream = require('JSONStream')
//var jsonBody = require('body/json')
//var through = require('through2')
//var filter = require('filter-object')
//var extend = require('extend')
//
//var errorResponse = require('../../lib/error-response')
//
//module.exports = function (profiles, options) {
//  var handler = {}
//
//  handler.index = function (req, res, options) {
//    if (req.method === 'GET') {
//      profiles.createReadStream()
//        .pipe(JSONStream.stringify())
//        .pipe(res)
//    }
//
//    if (req.method === 'POST') {
//      jsonBody(req, res, function (err, body) {
//        profiles.create(body, function (err, profile) {
//          if (err) return errorResponse(res, 400, 'Error creating profile')
//          return response().json(profile).pipe(res)
//        })
//      })
//    }
//  }
//
//  handler.item = function (req, res, options) {
//    if (req.method === 'GET') {
//      profiles.get(options.params.key, function (err, profile) {
//        if (err) return errorResponse(res, 400, 'Error creating profile')
//        return response().json(profile).pipe(res)
//      })
//    }
//
//    if (req.method === 'PUT') {
//      jsonBody(req, res, function (err, body) {
//        profiles.update(options.params.key, body, function (err, profile) {
//          if (err) return errorResponse(res, 400, 'Error creating profile')
//          return response().json(profile).pipe(res)
//        })
//      })
//    }
//
//    if (req.method === 'DELETE') {
//      profiles.delete(options.params.key, function (err) {
//        if (err) return errorResponse(res, 400, 'Error creating profile')
//        res.writeHead(204)
//        return res.end()
//      })
//    }
//  }
//
//  return handler
//}
