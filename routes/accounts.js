var qs = require('querystring');
var response = require('response');
var JSONStream = require('JSONStream');
var formBody = require('body/form');
var redirect = require('../lib/redirect');

module.exports = function routes (server) {
  var prefix = '/accounts';
  
  server.router.on(prefix, function (req, res, options) {
    server.authorizeAPI
      if (req.method === 'GET') {
        server.authorizeSession(req, res, function (error, account, session) {
          if (!account.admin || error) {
            if (error) console.log(error);
            return redirect(res, '/');
          }

          var results = [];
          var stream = server.accounts.list();

          stream
            .on('data', function (data) {
              results.push(data);
            })
            .on('error', function (err) {
              return console.log(err);
            })
            .on('end', function () {
              var html = server.render('accounts', { accounts: results, account: account });
              return response().html(html).pipe(res);
            });
        });
      }
    
    if (req.method === 'POST') {
      formBody(req, res, function (err, body) {
        var options = {
          login: { basic: { username: body.username, password: body.password } },
          value: { email: body.email, username: body.username }
        };

        server.accounts.create(body.username, options, function (err) {          
          if (err) {
            console.error(err);
            redirect(res, '/');
          }

          server.auth.login(res, { username: body.username }, function (sessionerr) {
            if (err) console.error(sessionerr);
            return redirect(res, '/');
          });
        });
      });
    }
  });

  server.router.on(prefix + '/new', function (req, res, options) {
    server.getAccountBySession(req, function (err, account, session) {
      if (!err && !account.admin) return redirect(res, '/');

      if (req.method === 'GET') {
        var html = server.render('accounts-new');
        return response().html(html).pipe(res);
      }
    });
  });

  server.router.on(prefix + '/update/:username', function (req, res, options) {
    server.getAccountBySession(req, function (err, account, session) {
      if (err) return console.error(error)

      if (account.admin) {
        if (req.method === 'POST') {
          updateAccountFromForm(req, res, options.params);
          return redirect(res, prefix);
        }
        if (req.method === 'GET') renderAccountUpdateForm(res, options.params.username, account);
      } else {
        if (res.account.key !== options.params.username) return console.log("You must be admin to update an account which is not yours");
        if (req.method === 'POST' ) updateAccountFromForm(req, res, options.params);
        if (req.method === 'GET') renderAccountUpdateForm(res, options.params.username, account);
        return redirect(res, '/');
      }
    });
  });

  server.router.on(prefix + '/sign-in', function (req, res, options) {    
    server.getAccountBySession(req, function (err, account, session) {
      if (!err) return redirect(res, '/');

      if (req.method === 'GET') {
        var html = server.render('accounts-signin');
        return response().html(html).pipe(res);
      }

      else if (req.method === 'POST') {
        formBody(req, res, function (err, body) {
          server.accounts.verify('basic', body, function (err, ok, id) {
            if (err || !ok) {
              if (err) console.error(err);
              if (!ok) console.error(new Error('incorrect password or username'));
              return redirect(res, '/');
            }

            server.auth.login(res, { username: id }, function (loginerr, data) {
              if (loginerr) console.error(loginerr);
              redirect(res, '/');
            });
          });
        });
      }
    });
  });

  server.router.on(prefix + '/sign-out', function (req, res, options) {
    server.auth.delete(req, function () {
      server.auth.cookie.destroy(res);
      redirect(res, '/');
    });
  });
  
  
  /*
  * Helper functions for managing accounts
  */
  
  function createAccount(options) {
    server.accounts.create(options.login.basic.username, options, logIfError);
  }

  function updateAccount(options) {
    var username = options.login.basic.username;
    server.accounts.get(username, function (err, value) {
      for (var key in value) { // Add existing features from the original value
        if (value.hasOwnProperty(key) && !options.value.hasOwnProperty(key)) {
          options.value[key] = value[key];
        }
      }
      server.accounts.put(username, options.value, logIfError);
    });
  }

  function renderAccountUpdateForm(res, username, account) {
    server.accounts.get(username, function (err, editingAccount) {
      var html = server.render('accounts-update', { editingAccount: editingAccount, account: account })
      response().html(html).pipe(res);
    });
  }

  function updateAccountFromForm(req, res, params) {
    formBody(req, res, function(err, body) {
      modifyAccountFromForm(err, body, params.username, updateAccount);
    });
  }

  function modifyAccountFromForm(err, body, username, accountOperation) {
    body.admin = !!body.admin; // ie 'true' => true

    var options = {
      login: {
        basic: {
          username: username,
          password: body.password
        }
      },
      value: {
        admin: body.admin,
        email: body.email,
        username: username
      }
    };

    accountOperation(options);
  }

  function logIfError(err) {
    // TODO: implement a notification of error on page
    if (err) console.error(err);
  }
}
