module.exports = function (query) {
  return function filter (item, enc, next) {
    var self = this
    filterKeys(Object.keys(query))

    function filterKeys (keys) {
      keys.every(function (key, i) {
        var index = query[key].indexOf(item.value[key])
        if (index === -1) return next()
        keys.splice(index, 1)

        if (keys.length === 0) {
          self.push(item)
          return next()
        }

        filterKeys(keys)
      })
    }
  }
}