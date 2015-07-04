//var Model = require('level-model')
//var inherits = require('inherits')
//var extend = require('extend')
//
//module.exports = Accounts
//inherits(Accounts, Model)
//
//function Accounts (db, options) {
//  if (!(this instanceof Accounts)) return new Accounts(db, options)
//
//  options = extend(options || {}, {
//    modelName: 'profiles',
//    properties: {
//      username: { type: 'string' },
//      email: { type: 'string' }
//    },
//    indexKeys: ['username', 'email'],
//    required: ['username', 'email']
//  })
//
//  Model.call(this, db, options)
//}

var sublevel = require('subleveldown')

module.exports = function (db) {
  function accountdownBasic (db, prefix) {
    return require('accountdown-basic')(db, prefix, { key: 'key' })
  }

  var accountdown = require('accountdown')(sublevel(db, 'accounts'), {
    login: { basic: accountdownBasic }
  })

  var accounts = require('accountdown-model')(accountdown, {
    db: db,
    properties: {
      username: { type: 'string' },
      email: { type: 'string' },
      profile: { type: 'string' }
    },
    required: ['username', 'email'],
    indexKeys: ['username', 'email', 'profile']
  })

   //TODO: create, update, and delete profiles along with accounts
  //var profiles = require('./profiles')(db)

  accounts.on('create', function (account) {
    console.log('create', account)
  })

  accounts.on('update', function (account) {
    console.log('update', account)
  })

  accounts.on('delete', function (account) {
    console.log('delete', account)
  })

  return accounts
}
