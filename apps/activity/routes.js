module.exports = function (handler, options) {
  var router = require('match-routes')()
  var prefix = options.prefix || '/api/v1'

  router.on(prefix + '/activity', handler.index.bind(handler))
  router.on(prefix + '/activity/:key', handler.item.bind(handler))

  return router
}
