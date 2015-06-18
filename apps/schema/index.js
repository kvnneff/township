module.exports = function (server, options) {
  var handler = require('./handler')(server, options)
  var routes = require('./routes')(handler, options)

  return {
    name: 'schema',
    handler: handler,
    routes: routes,
    serve: function (req, res) {
      return routes.match(req, res)
    }
  }
}