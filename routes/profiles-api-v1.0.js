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

  server.router.on(prefix + '/profiles', function (req, res, opts) {
    server.authorize(req, res, function (authError, authAccount) {
      var notAuthorized = (authError || !authAccount)
      console.log('authorized?', authError, authAccount)
      if (req.method === 'GET') {
        server.profiles.createReadStream()
          .on('data', console.log)
          .pipe(JSONStream.stringify())
          .pipe(res)
      }

      if (req.method === 'POST') {
        console.log('posting?')
        if (notAuthorized) return errorResponse(res, 401, 'Not Authorized')

        jsonBody(req, res, function (err, body) {
          server.profiles.create(body, function (err, profile) {
            console.log('after create', profile)
            if (err) return errorResponse(res, 500, 'Server error')
            return response().json(profile).pipe(res)
          })
        })
      }
    })
  })

  server.router.on(prefix + '/profiles/:key', function (req, res, opts) {
    server.authorize(req, res, function (authError, authAccount) {
      var notAuthorized = (authError || !authAccount)

      if (req.method === 'GET') {
        server.profiles.get(opts.params.key, function (err, profile) {
          if (err) return errorResponse(res, 500, 'Server error')
          return response().json(profile).pipe(res)
        })
      }

      if (req.method === 'PUT') {
        if (notAuthorized) return errorResponse(res, 401, 'Not Authorized')

        jsonBody(req, res, function (err, body) {
          server.profiles.update(opts.params.key, body, function (err, profile) {
            if (err) return errorResponse(res, 500, 'Server error')
            return response().json(profile).pipe(res)
          })
        })
      }

      if (req.method === 'DELETE') {
        if (notAuthorized) return errorResponse(res, 401, 'Not Authorized')

        server.profiles.delete(opts.params.key, function (err) {
          if (err) return errorResponse(res, 500, 'Server error')
          res.writeHead(204);
          return res.end();
        })
      }
    })
  })
}