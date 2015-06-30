var Model = require('level-model')
var inherits = require('inherits')
var extend = require('extend')

module.exports = Activity
inherits(Activity, Model)

function Activity (db, options) {
  if (!(this instanceof Activity)) return new Activity(db, options)

  options = extend(options || {}, {
    modelName: 'activity',
    properties: {
      action: { type: 'string' },
      resource: { type: 'string' },
      resourceKey: { type: 'string' },
      account: { type: 'string' },
      message: { type: 'string' },
      source: { type: 'string' },
      sourceURL: { type: 'string' },
      metadata: { type: 'object' }
    },
    indexKeys: ['action', 'resource', 'resourceKey', 'account', 'source'],
    required: ['action', 'resource', 'resourceKey', 'account', 'message']
  })

  Model.call(this, db, options)
}