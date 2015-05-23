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

  server.router.on(prefix + '/posts/:postkey/comments', function (req, res, opts) {
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
          server.posts.create(body, function (err, res) {
            if (err) return errorResponse(res, 500, 'Server error')
            return response().json(body).pipe(res)
          })
        })
      }
    })
  })

  server.router.on(prefix + '/posts/:postkey/comments/:commentkey', function (req, res, opts) {
    server.authorize(req, res, function (authError, authAccount) {
      if (req.method === 'GET') {
        server.comments.get(opts.params.commentkey, function (err, res) {
          if (err) return errorResponse(res, 500, 'Server error')

          return response().json(body).pipe(res)
        })
      }

      if (req.method === 'PUT') {
        if (notAuthorized) return errorResponse(res, 401, 'Not Authorized')

        jsonBody(req, res, function (err, body) {
          server.comments.update(opts.params.commentkey, body, function (err, res) {
            if (err) return errorResponse(res, 500, 'Server error')
            return response().json(body).pipe(res)
          })
        })
      }

      if (req.method === 'DELETE') {
        if (notAuthorized) return errorResponse(res, 401, 'Not Authorized')

        server.comments.delete(opts.params.commentkey, function (err) {
          if (err) return errorResponse(res, 500, 'Server error')
          return response().status(204).pipe(res)
        })
      }
    })
  })
}
