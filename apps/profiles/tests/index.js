var test = require('tape')
var each = require('each-async')

var db = require('memdb')()
var accounts = require('../../accounts/model')(db)

var profiles = require('../model')(db, accounts)

test('create a profile', function (t) {
  var data = {
    account: 'test',
    username: 'jane',
    email: 'jane@doe.com'
  }

  profiles.create(data, function (err, profile) {
    t.notOk(err)
    t.ok(profile)
    t.end()
  })
})

test('create sample profile data', function (t) {
  var data = require('./fixtures/profiles')

  each(data, function (action, i, next) {
    profiles.create(action, function (err, action) {
      t.notOk(err)
      t.ok(action)
      next()
    })
  }, function () {
    t.end()
  })
})

test('get a profile', function (t) {
  var data = {
    username: 'jane'
  }

  profiles.findOne('username', data.username, function (err, profile) {
    t.notOk(err)
    t.ok(profile)
    t.end()
  })
})

test('get and delete a profile', function (t) {
  var data = {
    account: 'test',
    username: 'jane',
    email: 'jane@doe.com'
  }

  profiles.findOne('username', data.username, function (err, profile) {
    t.notOk(err)
    t.ok(profile)

    profiles.delete(profile.key, function (err) {
      t.notOk(err)
      profiles.get(profile.key, function (err, profile) {
        t.notOk(profile)
        t.ok(err)
        t.end()
      })
    })
  })
})
