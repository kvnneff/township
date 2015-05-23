var qs = require('querystring');
var response = require('response');
var JSONStream = require('JSONStream');
var jsonBody = require('body/json');
var through = require('through2');
var filter = require('filter-object');
var extend = require('extend');

var errorResponse = require('../lib/error-response')

module.exports = function (server) {
  var prefix = '/api/v1.0/';

  server.router.on(prefix + '/activity', function (req, res, opts) {
    server.authorize(req, res, function (authError, authAccount) {
      var notAuthorized = (authError || !authAccount);

      if (req.method === 'GET') {
        if (opts.query) {
          return server.activity.createFilterStream(opts.query)
            .pipe(JSONStream.stringify())
            .pipe(res)
        }
        
        return server.activity.createReadStream()
          .pipe(JSONStream.stringify())
          .pipe(res)
      }

      if (req.method === 'POST') {
        if (notAuthorized) return errorResponse(res, 401, 'Not authorized')
        
        jsonBody(req, function (err, data) {
          server.activity.put(data, function (err, action) {
            if (err) return errorResponse(res, 500, 'Server error')
            response().json(action).pipe(res)
          })
        })
      }
    })
  })

  server.router.on(prefix + '/activity/:key', function (req, res, opts) {
    server.authorize(req, res, function (authError, authAccount) {
      var notAuthorized = (authError || !authAccount);

      if (req.method === 'GET') {
        server.activity.get(opts.params.key, function (err, action) {
          if (err || !action) return errorResponse(res, 404, 'Not found')
          response().json(action).pipe(res)
        })
      }

      if (req.method === 'DELETE') {
        if (notAuthorized) return errorResponse(res, 401, 'Not authorized')
        server.activity.delete(opts.params.key, function (err) {
          if (err) return errorResponse(res, 500, 'Server error')
          res.writeHead(204);
          return res.end();
        })
      }
    })
  })
}