module.exports = function (db, options) {
  options = options || {}
  var model = require('./model')(db, options)
  var handler = require('./handler')(model, options)
  var routes = require('./routes')(handler, options)

  return {
    name: 'comments',
    schema: model.schema,
    model: model,
    handler: handler,
    routes: routes,
    serve: function (req, res) {
      return routes.match(req, res)
    }
  }
}