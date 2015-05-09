var qs = require('querystring');
var response = require('response');
var JSONStream = require('JSONStream');
var formBody = require('body/form');
var redirect = require('../lib/redirect');

module.exports = function routes (server) {
  var prefix = '/accounts';
  
  server.router.on(prefix, function (req, res, opts) {
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
        var opts = {
          login: { basic: { username: body.username, password: body.password } },
          value: { email: body.email, username: body.username }
        };

        server.accounts.create(body.username, opts, function (err) {          
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

  server.router.on(prefix + '/new', function (req, res, opts) {
    server.getAccountBySession(req, function (err, account, session) {
      if (!err && !account.admin) return redirect(res, '/');

      if (req.method === 'GET') {
        var html = server.render('accounts-new');
        return response().html(html).pipe(res);
      }
    });
  });

  server.router.on(prefix + '/update/:username', function (req, res, opts) {
    server.getAccountBySession(req, function (err, account, session) {
      if (err) return console.error(error)

      if (account.admin) {
        if (req.method === 'POST') {
          updateAccountFromForm(req, res, opts.params);
          return redirect(res, prefix);
        }
        if (req.method === 'GET') renderAccountUpdateForm(res, opts.params.username, account);
      } else {
        if (res.account.key !== opts.params.username) return console.log("You must be admin to update an account which is not yours");
        if (req.method === 'POST' ) updateAccountFromForm(req, res, opts.params);
        if (req.method === 'GET') renderAccountUpdateForm(res, opts.params.username, account);
        return redirect(res, '/');
      }
    });
  });

  server.router.on(prefix + '/sign-in', function (req, res, opts) {    
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

  server.router.on(prefix + '/sign-out', function (req, res, opts) {
    server.auth.delete(req, function () {
      server.auth.cookie.destroy(res);
      redirect(res, '/');
    });
  });
  
  
  /*
  * Helper functions for managing accounts
  */
  
  function createAccount(opts) {
    server.accounts.create(opts.login.basic.username, opts, logIfError);
  }

  function updateAccount(opts) {
    var username = opts.login.basic.username;
    server.accounts.get(username, function (err, value) {
      for (var key in value) { // Add existing features from the original value
        if (value.hasOwnProperty(key) && !opts.value.hasOwnProperty(key)) {
          opts.value[key] = value[key];
        }
      }
      server.accounts.put(username, opts.value, logIfError);
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

    var opts = {
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

    accountOperation(opts);
  }

  function logIfError(err) {
    // TODO: implement a notification of error on page
    if (err) console.error(err);
  }
}
