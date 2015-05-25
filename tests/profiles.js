var test = require('tape')
var each = require('each-async')

var levelup = require('level')
var db = levelup('./tmp/db-comments')

var profiles = require('../lib/profiles')(db)

test('create a profile', function (t) {
  var data = {
    account: '1',
    email: 'test@example.com'
  }

  profiles.create(data, function (err, comment) {
    t.notOk(err)
    t.ok(comment)
    t.end()
  })
})

test('get a profile', function (t) {
  t.end()
})

test('update a profile', function (t) {
  t.end()
})

test('create many profiles', function (t) {
  t.end()
})

test('get list of profiles', function (t) {
  t.end()
})

test('get profile associated with account', function (t) {
  t.end()
})

test('get list of profiles that are followed by a profile', function (t) {
  t.end()
})

test('get followers of a profile', function (t) {
  t.end()
})

test('can not get private account unless following', function (t) {
  t.end()
})

test('teardown profiles', function (t) {
  profiles.createReadStream()
    .on('data', function (data) {
      profiles.delete(data.key, function (err) {
        t.notOk(err)
      })
    })
    .on('end', function () {
      t.end()
    })
})