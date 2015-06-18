var qs = require('querystring')
var response = require('response')
var JSONStream = require('JSONStream')
var jsonBody = require('body/json')
var through = require('through2')
var filter = require('filter-object')
var extend = require('extend')

var errorResponse = require('../../lib/error-response')

module.exports = function (profiles, options) {
  var handler = {}

  handler.index = function (req, res, options) {
    if (req.method === 'GET') {
      profiles.createReadStream()
        .pipe(JSONStream.stringify())
        .pipe(res)
    }

    if (req.method === 'POST') {
      jsonBody(req, res, function (err, body) {
        profiles.create(body, function (err, profile) {
          if (err) return errorResponse(res, 400, 'Error creating profile')
          return response().json(profile).pipe(res)
        })
      })
    }
  }

  handler.item = function (req, res, options) {
    if (req.method === 'GET') {
      profiles.get(options.params.key, function (err, profile) {
        if (err) return errorResponse(res, 400, 'Error creating profile')
        return response().json(profile).pipe(res)
      })
    }

    if (req.method === 'PUT') {
      jsonBody(req, res, function (err, body) {
        profiles.update(options.params.key, body, function (err, profile) {
          if (err) return errorResponse(res, 400, 'Error creating profile')
          return response().json(profile).pipe(res)
        })
      })
    }

    if (req.method === 'DELETE') {
      profiles.delete(options.params.key, function (err) {
        if (err) return errorResponse(res, 400, 'Error creating profile')
        res.writeHead(204)
        return res.end()
      })
    }
  }

  return handler
}
