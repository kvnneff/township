module.exports = function (handler, options) {
  var router = require('match-routes')()
  var prefix = options.prefix || '/api/v1'

  router.on(prefix + '/', handler.index.bind(handler))

  return router
}
