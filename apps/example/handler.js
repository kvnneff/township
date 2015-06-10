var response = require('response')

module.exports = function (model, options) {
  var handler = {}

  handler.index = function (req, res, opts) {
    model.findOne('tags', 'example', function (err, value) {
      response().json(value).pipe(res)
    })
  }

  return handler
}