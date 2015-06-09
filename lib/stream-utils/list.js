module.exports = function (options, cb) {
  if (!options && !cb) options = {}
  if (typeof options === 'object' && !cb) return this.createReadStream(options)

  if (typeof options === 'function') {
    cb = options
    options = {}
  }

  var data = []
  options.reverse = options.reverse || true

  this.createReadStream(options)
    .on('data', function (item) { data.push(item) })
    .on('end', function () { cb(null, data) })
}