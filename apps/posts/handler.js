var qs = require('querystring')
var response = require('response')
var JSONStream = require('JSONStream')
var jsonBody = require('body/json')
var through = require('through2')
var filter = require('filter-object')
var extend = require('extend')

var errorResponse = require('../../lib/error-response')

module.exports = function (posts, options) {
  var handler = {}

  handler.index = function (req, res, options) {
    if (req.method === 'GET') {
      posts.createReadStream()
        .pipe(JSONStream.stringify())
        .pipe(res)
    }

    if (req.method === 'POST') {
      jsonBody(req, res, function (err, body) {
        posts.create(body, function (err, post) {
          if (err) return errorResponse(res, 400, 'Error creating post')
          return response().json(post).pipe(res)
        })
      })
    }
  }

  handler.item = function (req, res, options) {
    if (req.method === 'GET') {
      posts.get(options.params.key, function (err, post) {
        if (err) return errorResponse(res, 400, 'Error creating post')
        return response().json(post).pipe(res)
      })
    }

    if (req.method === 'PUT') {
      jsonBody(req, res, function (err, body) {
        posts.update(options.params.key, body, function (err, post) {
          if (err) return errorResponse(res, 400, 'Error creating post')
          return response().json(post).pipe(res)
        })
      })
    }

    if (req.method === 'DELETE') {
      posts.delete(options.params.key, function (err) {
        if (err) return errorResponse(res, 400, 'Error creating post')
        res.writeHead(204)
        return res.end()
      })
    }
  }
  
  return handler
}
