var test = require('tape')
var each = require('each-async')

var client = require('../index')({
  host: 'http://127.0.0.1:4243',
  username: 'pizza',
  password: 'pizza'
})

test('create an activity', function (t) {
  var data = {
    action: 'create',
    resource: 'post',
    resourceKey: '1',
    account: 'test',
    message: 'oooh, i am actively creating a post.',
  }
  
  client.activity.put(data, function (err, action) {
    t.notOk(err)
    t.ok(action)
    t.end()
  })
})

test('create sample activity data', function (t) {
  var data = require('../../tests/data/activity')
  
  each(data, function (action, i, next) {
    client.activity.put(action, function (err, action) {
      t.notOk(err)
      t.ok(action)
      next()
    })
  }, function () {
    t.end()
  })
})

test('get an activity', function (t) {
  var data = {
    action: 'create',
    resource: 'post',
    resourceKey: '1',
    account: 'test',
    message: 'oooh, i am actively creating a post.',
  }

  client.activity.put(data, function (err, action) {
    t.notOk(err)
    t.ok(action)

    client.activity.get(action.key, function (err, action) {
      t.ok(action)
      t.end()
    })
  })
})

test('delete an activity', function (t) {
  var data = {
    action: 'create',
    resource: 'post',
    resourceKey: '1',
    account: 'test',
    message: 'oooh, i am actively creating a post.',
  }

  client.activity.put(data, function (err, action) {
    t.notOk(err)
    t.ok(action)
    client.activity.delete(action.key, function (err) {
      t.notOk(err)
      client.activity.get(action.key, function (err, action) {
        t.ok(err)
        t.end()
      })
    })
  })
})

/*
test('create simple find stream', function (t) {
  client.activity.find('resource', 'post')
    .on('data', function (data) {
      t.ok(data)
    })
    .on('end', function () {
      t.end()
    })
})

test('create complex filter stream', function (t) {
  var count = 0
  var all = []
  activity.createFilterStream({ resource: ['post'], resourceKey: ['2'] })
    .on('data', function (data) {
      t.ok(data)
      all.push(data)
      count++
    })
    .on('end', function () {
      t.equal(count, 1)
      t.end()
    })
})

test('create stream of comment updates', function (t) {
  var count = 0
  activity.createFilterStream({ resource: ['comment'], action: ['update'] })
    .on('data', function (data) {
      t.ok(data)
      count++
    })
    .on('end', function () {
      t.equal(count, 4)
      t.end()
    })
})
*/

test('teardown', function (t) {
  client.activity.list(function (err, res) {
    
    each(res, iterator, end)
      
    function iterator (item, i, done) {
      client.activity.delete(item.key, function (err) {
        t.notOk(err, 'no error when deleting activity')
        done()
      })
    }
    
    function end () {
      t.end()
    }
  })
})