var qs = require('querystring')
var response = require('response')
var JSONStream = require('JSONStream')
var format = require('json-format-stream')
var jsonBody = require('body/json')
var through = require('through2')
var filter = require('filter-object')
var extend = require('extend')

var errorResponse = require('../lib/error-response')

module.exports = function (server) {
  var prefix = '/api/v1.0/'

  server.router.on(prefix + '/comments', function (req, res, opts) {
    console.log(opts)
    server.authorize(req, res, function (authError, authAccount) {
      var notAuthorized = (authError || !authAccount)

      if (req.method === 'GET') {
        server.comments.find('post', opts.params.postkey)
          .pipe(JSONStream.stringify())
          .pipe(res)
      }

      if (req.method === 'POST') {
        if (notAuthorized) return errorResponse(res, 401, 'Not Authorized')

        jsonBody(req, res, function (err, body) {
          server.comments.create(body, function (err, comment) {
            if (err) return errorResponse(res, 500, 'Server error')
            return response().json(comment).pipe(res)
          })
        })
      }
    })
  })

  server.router.on(prefix + '/comments/:key', function (req, res, opts) {
    console.log(opts)
    server.authorize(req, res, function (authError, authAccount) {
      var notAuthorized = (authError || !authAccount)

      if (req.method === 'GET') {
        server.comments.get(opts.params.key, function (err, comment) {
          if (err) return errorResponse(res, 500, 'Server error')

          return response().json(comment).pipe(res)
        })
      }

      if (req.method === 'PUT') {
        if (notAuthorized) return errorResponse(res, 401, 'Not Authorized')

        jsonBody(req, res, function (err, body) {
          server.comments.update(opts.params.key, body, function (err, comment) {
            if (err) return errorResponse(res, 500, 'Server error')
            return response().json(comment).pipe(res)
          })
        })
      }

      if (req.method === 'DELETE') {
        if (notAuthorized) return errorResponse(res, 401, 'Not Authorized')

        server.comments.delete(opts.params.key, function (err) {
          if (err) return errorResponse(res, 500, 'Server error')
          res.writeHead(204);
          return res.end();
        })
      }
    })
  })
}
