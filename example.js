
/*
* When you clone this repository to do development on the project and 
* run `npm start`, this is the file that gets run.

* This file also serves as an example of how you can use the app as a dependency 
* in another project. This is useful in production so you can install
* the app using npm, and pull in the latest version of the app using npm
* instead of manually pulling and merging changes via git.
*/

var response = require('response');
var level = require('level');
var db = level(__dirname + '/db');

var app = require('./lib/index')(db);

app.router.on('/', function (req, res, opts) {
  app.getAccountBySession(req, function (err, account, session) {
    var html = app.render('index', { account: account });
    response().html(html).pipe(res);
  });
});

app.listen();