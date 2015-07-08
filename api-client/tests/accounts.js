var test = require('tape')
var each = require('each-async')

var client = require('../index')({
  host: 'http://127.0.0.1:4243',
  username: 'pizza',
  password: 'pizza'
})


test('create an account', function (t) {
  var account = {
    email: 'wee@example.com',
    username: 'example',
    password: 'wat'
  }

  client.model.create(account, function (err, res) {
    t.ok(res)
    t.notOk(err)
    t.end()
  })
})


test('update an account', function (t) {
  var account = {
    email: 'wat@example.com',
    username: 'wat',
    password: 'wat'
  }

  client.model.create(account, function (err, res) {
    t.ok(res)
    t.notOk(err)
    res.email = 'wooo@example.com'
    
    client.model.update(res.username, res, function (err, updated) {
      t.notOk(err)
      t.ok(updated.email === 'wooo@example.com')
      t.end()
    })

  })
})


test('get list of accounts', function (t) {
  client.model.list(function (err, res) {
    t.ok(res)
    t.notOk(err)
    t.end()
  })
})


test('get list of admin accounts', function (t) {
  client.model.list({ admin: true }, function (err, res) {
    t.ok(res)
    t.notOk(err)
    t.end()
  })
})


test('teardown', function (t) {
  client.model.list(function (err, res) {
    each(res, iterator, end)
      
    function iterator (item, i, done) {
      if (item.username === 'pizza') return done()

      client.model.delete(item.username, function (err) {
        t.notOk(err, 'no error when deleting account')
        done()
      })
    }
    
    function end () {
      t.end()
    }
  })
})
