module.exports = function (opts, cb) {
  if (!opts && !cb) opts = {}
  if (typeof opts === 'object' && !cb) return this.createReadStream(opts)

  if (typeof opts === 'function') {
    cb = opts
    opts = {}
  }

  var data = []
  opts.reverse = opts.reverse || true

  this.createReadStream(opts)
    .on('data', function (item) { data.push(item) })
    .on('end', function () { cb(null, data) })
}