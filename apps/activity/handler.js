var qs = require('querystring')
var response = require('response')
var JSONStream = require('JSONStream')
var jsonBody = require('body/json')
var through = require('through2')
var filter = require('filter-object')
var extend = require('extend')

var errorResponse = require('../../lib/error-response')

module.exports = function (activity, options) {
  var handler = {}

  handler.index = function (req, res, options) {
    if (req.method === 'GET') {
      if (options.query) {
        return activity.createFilterStream(options.query)
          .pipe(JSONStream.stringify())
          .pipe(res)
      }
      
      return activity.createReadStream()
        .pipe(JSONStream.stringify())
        .pipe(res)
    }

    if (req.method === 'POST') {
      jsonBody(req, function (err, data) {
        activity.put(data, function (err, action) {
          if (err) return errorResponse(res, 400, 'Error creating activity')
          response().json(action).pipe(res)
        })
      })
    }
  }

  handler.item = function (req, res, options) {
    if (req.method === 'GET') {
      activity.get(options.params.key, function (err, action) {
        if (err || !action) return errorResponse(res, 404, 'Not found')
        response().json(action).pipe(res)
      })
    }

    if (req.method === 'DELETE') {
      activity.delete(options.params.key, function (err) {
        if (err) return errorResponse(res, 400, 'Error creating activity')
        res.writeHead(204)
        return res.end()
      })
    }
  }

  return handler
}