module.exports = function (db, options) {
  options = options || {}
  var model = require('./model')(db, options)
  var handler = require('./handler')(model, options)
  var routes = require('./routes')(handler, options)

  return {
    name: 'accounts',
    model: model,
    schema: model.schema,
    handler: handler,
    routes: routes,
    serve: function (req, res) {
      return routes.match(req, res)
    }
  }
}