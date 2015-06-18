var qs = require('querystring')
var response = require('response')
var JSONStream = require('JSONStream')
var jsonBody = require('body/json')
var through = require('through2')
var filter = require('filter-object')
var extend = require('extend')

var errorResponse = require('../lib/error-response')

module.exports = function (model, options) {
  var handler = {}

  handler.index = function (req, res, options) {
    server.authorize(req, res, function (authError, authAccount) {
      var notAuthorized = (authError || !authAccount)

      if (req.method === 'GET') {
        server.posts.createReadStream()
          .pipe(JSONStream.stringify())
          .pipe(res)
      }

      if (req.method === 'POST') {
        if (notAuthorized) return errorResponse(res, 401, 'Not Authorized')

        jsonBody(req, res, function (err, body) {
          server.posts.create(body, function (err, post) {
            if (err) return errorResponse(res, 500, 'Server error')
            return response().json(post).pipe(res)
          })
        })
      }
    })
  }

  handler.item = function (req, res, options) {
    server.authorize(req, res, function (authError, authAccount) {
      var notAuthorized = (authError || !authAccount)

      if (req.method === 'GET') {
        server.posts.get(options.params.key, function (err, post) {
          if (err) return errorResponse(res, 500, 'Server error')

          return response().json(post).pipe(res)
        })
      }

      if (req.method === 'PUT') {
        if (notAuthorized) return errorResponse(res, 401, 'Not Authorized')

        jsonBody(req, res, function (err, body) {
          server.posts.update(options.params.key, body, function (err, post) {
            if (err) return errorResponse(res, 500, 'Server error')
            return response().json(post).pipe(res)
          })
        })
      }

      if (req.method === 'DELETE') {
        if (notAuthorized) return errorResponse(res, 401, 'Not Authorized')

        server.posts.delete(options.params.key, function (err) {
          if (err) return errorResponse(res, 500, 'Server error')
          res.writeHead(204)
          return res.end()
        })
      }
    })
  }
  
  return handler
}
