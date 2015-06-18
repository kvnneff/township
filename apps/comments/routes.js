module.exports = function (handler, options) {
  var router = require('match-routes')()
  var prefix = options.prefix || '/api/v1/'

  router.on(prefix + '/comments', handler.index.bind(handler))
  router.on(prefix + '/comments/:key', handler.item.bind(handler))

  return router
}
