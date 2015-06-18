module.exports = function (handler, options) {
  var router = require('match-routes')()
  var prefix = options.prefix || '/api/v1/'

  router.on(prefix + '/profiles', handler.index.bind(handler))
  router.on(prefix + '/profiles/:key', handler.item.bind(handler))

  return router
}