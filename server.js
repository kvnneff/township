
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
var posts = require('./apps/discuss/posts')(db),
var comments = require('./apps/discuss/comments')(db),
var accounts = require('./apps/accounts')(db)
var profiles = require('./apps/profiles')(db)

var server = require('./lib/index')(db, {
  apps: [activity, posts, comments, accounts, profiles]
})

accounts.on('create', function (account) {
  profiles.create(account, function (err, profile) {
    console.log(err, profile)
  })
})

accounts.on('update', function (account) {
  profiles.update(account, function (err, profile) {
    console.log(err, profile)
  })
})

accounts.on('delete', function (account) {
  profiles.delete(account, function (err, profile) {
    console.log(err, profile)
  })
})

server.listen()
