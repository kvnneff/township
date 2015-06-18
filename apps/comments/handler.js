var qs = require('querystring')
var response = require('response')
var JSONStream = require('JSONStream')
var format = require('json-format-stream')
var jsonBody = require('body/json')
var through = require('through2')
var filter = require('filter-object')
var extend = require('extend')

var errorResponse = require('../../lib/error-response')

module.exports = function (comments, options) {
  var handler = {}

  handler.index = function (req, res, options) {
    if (req.method === 'GET') {
      comments.find('post', options.params.postkey)
        .pipe(JSONStream.stringify())
        .pipe(res)
    }

    if (req.method === 'POST') {
      jsonBody(req, res, function (err, body) {
        comments.create(body, function (err, comment) {
          if (err) return errorResponse(res, 400, 'Error creating comment')
          return response().json(comment).pipe(res)
        })
      })
    }
  }

  handler.item = function (req, res, options) {
    if (req.method === 'GET') {
      comments.get(options.params.key, function (err, comment) {
        if (err) return errorResponse(res, 400, 'Error creating comment')

        return response().json(comment).pipe(res)
      })
    }

    if (req.method === 'PUT') {
      jsonBody(req, res, function (err, body) {
        comments.update(options.params.key, body, function (err, comment) {
          if (err) return errorResponse(res, 400, 'Error creating comment')
          return response().json(comment).pipe(res)
        })
      })
    }

    if (req.method === 'DELETE') {
      comments.delete(options.params.key, function (err) {
        if (err) return errorResponse(res, 400, 'Error creating comment')
        res.writeHead(204)
        return res.end()
      })
    }
  }

  return handler
}
