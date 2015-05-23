var Emitter = require('events').EventEmitter
var inherits = require('util').inherits
var sublevel = require('subleveldown')
var through = require('through2')
var each = require('each-async')
var cuid = require('cuid')

var indexer = require('./indexer')

module.exports = ActivityTracker
inherits(ActivityTracker, Emitter)

function ActivityTracker (db, options) {
  if (!(this instanceof ActivityTracker)) return new ActivityTracker(db, options)
  options = options || {}
  this.source = options.title
  this.sourceUrl = options.url
  this.db = sublevel(db, options.prefix || 'activity', { valueEncoding: 'json' })
  Emitter.call(this)
  var self = this

  this.indexer = indexer(sublevel(db, 'activity-index'), {
    properties: ['action', 'resource', 'resourceKey', 'account', 'source'],
    map: function (key, cb) { self.get(key, cb) }
  })
}

ActivityTracker.prototype.put = function (data, callback) {
  data = this.format(data)
  if (data instanceof Error) return (callback(data))
  var key = cuid()
  this.db.put(key, data, function (err) {
    if (err) return callback(err)
    callback(null, { key: key, value: data })
  })
}

ActivityTracker.prototype.get = function (key, callback) {
  this.db.get(key, callback)
}

ActivityTracker.prototype.delete = function (key, callback) {
  this.db.del(key, callback)
}

ActivityTracker.prototype.find =
ActivityTracker.prototype.createFindStream = function (index, key, options) {
  return this.indexer.find(index, key, options)
}

ActivityTracker.prototype.filter =
ActivityTracker.prototype.createFilterStream = function (query, options) {
  return this.db.createReadStream(options).pipe(through.obj(filter))

  function filter (item, enc, next) {
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

ActivityTracker.prototype.createReadStream = function (options) {
  return this.db.createReadStream(options)
}

ActivityTracker.prototype.format = function (data) {
  if (!data.action) return new Error('action property is required')
  if (!data.resource) return new Error('resource property is required')
  if (!data.resourceKey) return new Error('resourceKey property is required')
  if (!data.account) return new Error('account property is required')
  if (!data.message) return new Error('message property is required')

  return {
    action: data.action,
    resource: data.resource,
    resourceKey: data.resourceKey,
    account: data.account,
    message: data.message,
    source: data.source || this.source || null
    sourceUrl = data.sourceUrl || this.sourceUrl || null
    metadata: data.metadata || {}
  }
}