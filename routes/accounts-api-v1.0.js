var qs = require('querystring');
var response = require('response');
var JSONStream = require('JSONStream');
var jsonBody = require('body/json');
var through = require('through2');
var filter = require('filter-object');
var extend = require('extend');

module.exports = function (server) {
  var prefix = '/api/v1.0/accounts';

  server.router.on(prefix, function (req, res, opts) {
    server.authorizeAPI(req, function (authError, authAccount){
      var notAuthorized = (authError || !authAccount);

      if (req.method === 'GET') {
        if (notAuthorized) {
          server.accounts.list({ keys: false })
            .pipe(filterAccountDetails())
            .pipe(JSONStream.stringify())
            .pipe(res);
        }
        else {
          server.accounts.list({ keys: false })
            .pipe(JSONStream.stringify())
            .pipe(res);
        }
      }

      else if (req.method === 'POST') {
        if (notAuthorized) return response().status(401).json({ error: 'Not Authorized'}).pipe(res);
        
        jsonBody(req, res, function (err, body) {
          
          var opts = {
            login: { basic: { username: body.username, password: body.password } },
            value: filter(body, '!password')
          }
          
          server.accounts.create(body.username, opts, function (err) {          
            if (err) return response().status(500).json({ error: 'Server error' }).pipe(res)
            
            server.accounts.get(body.username, function (err, account) {
              if (err) return response().status(500).json({ error: 'Server error' }).pipe(res)
              
              response().json(account).pipe(res)
            })
          })
        })
        
      }
      
    })
  })

  server.router.on(prefix + '/:username', function (req, res, opts) {
    server.authorizeAPI(req, function (authError, authAccount){
      var notAuthorized = (authError || !authAccount);

      if (req.method === 'GET') {
        server.accounts.get(opts.params.username, function (err, account) {
          if (err) return response().status(500).json({ error: 'Server error' }).pipe(res);
          if (notAuthorized) {
            account = filter(account, ['*', '!email', '!admin']);
            return response().json(account).pipe(res);
          }
          
          return response().json(account).pipe(res);
        });
      }

      else if (req.method === 'PUT') {
        if (notAuthorized) return response().status(401).json({ error: 'Not Authorized'}).pipe(res);

        jsonBody(req, res, function (err, body) {
          server.accounts.get(opts.params.username, function (err, account) {
            account = extend(account, body)
            server.accounts.put(opts.params.username, account, function (err) {
              if (err) return response().status(500).json({ error: 'Server error' }).pipe(res);
              
              response().json(account).pipe(res)
            })
          })
        })
      }

      else if (req.method === 'DELETE') {
        if (notAuthorized) return response().status(401).json({ error: 'Not Authorized'}).pipe(res);

        server.accounts.remove(opts.params.username, function (err, account) {
          response().json(account).pipe(res);
        });
      }
    });
  });
}

function filterAccountDetails () {
  return through.obj(function iterator (chunk, enc, next) {
    this.push(filter(chunk, ['*', '!email', '!admin']));
    next();
  });
}