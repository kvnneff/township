
/*
* When you clone this repository to do development on the project and 
* run `npm start`, this is the file that gets run.

* This file also serves as an example of how you can use the app as a dependency 
* in another project. This is useful in production so you can install
* the app using npm, and pull in the latest version of the app using npm
* instead of manually pulling and merging changes via git.
*/

var level = require('level')
var db = level(__dirname + '/db')

var activity = require('./apps/activity')(db)
var posts = require('./apps/discuss/posts')(db)
var comments = require('./apps/discuss/comments')(db)
var accounts = require('./apps/accounts')(db)
var profiles = require('./apps/profiles')(db)

var server = require('./lib/index')(db, {
  apps: [activity, posts, comments, accounts, profiles]
})

accounts.model.on('create', function (account) {
  profiles.model.create(account, function (err, profile) {
    console.log(err, profile)
  })
})

accounts.model.on('update', function (account) {
  profiles.model.update(account, function (err, profile) {
    console.log(err, profile)
  })
})

accounts.model.on('delete', function (account) {
  profiles.model.delete(account, function (err, profile) {
    console.log(err, profile)
  })
})

server.listen()
