/*
app.router.on('/', function (req, res, options) {
  app.getAccountBySession(req, function (err, account, session) {
    var html = app.render('index', { account: account });
    response().html(html).pipe(res);
  });
});
*/

var response = require('response');
var JSONStream = require('JSONStream');
var redirect = require('../lib/redirect');

module.exports = function routes (server) {
  server.router.on('/', function (req, res, options) {
    if (req.method === 'GET') {
      server.authorizeSession(req, res, function (error, account, session) {

        // TODO: handle errors
        
        var view = (account && session) ? 'index' : 'landing'
        var html = server.render(view, { account: account })
        return response().html(html).pipe(res);
      });
    }
  })
}