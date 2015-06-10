module.exports = function (handler, options) {
  var router = require('match-routes')()

  router.on('/example', handler.index.bind(handler))

  return router
}