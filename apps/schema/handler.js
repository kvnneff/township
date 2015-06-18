var qs = require('querystring')
var response = require('response')
var JSONStream = require('JSONStream')
var jsonBody = require('body/json')
var through = require('through2')
var filter = require('filter-object')
var extend = require('extend')

var errorResponse = require('../../lib/error-response')

module.exports = function (server, options) {
  var handler = {}

  handler.index = function (req, res, options) {
    return response().json(server.schema()).pipe(res)
  }

  return handler
}