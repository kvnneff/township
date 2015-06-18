var test = require('tape')
var each = require('each-async')

var levelup = require('levelup')
var db = levelup('db', { db: require('memdown') })
var activity = require('../model')(db)

test('create an activity', function (t) {
  var data = {
    action: 'create',
    resource: 'post',
    resourceKey: '1',
    account: 'test',
    message: 'oooh, i am actively creating a post.',
  }

  activity.put(data, function (err, action) {
    t.notOk(err)
    t.ok(action)
    t.end()
  })
})

test('create sample activity data', function (t) {
  var data = require('./fixtures/activity')

  each(data, function (action, i, next) {
    activity.put(action, function (err, action) {
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

  activity.put(data, function (err, action) {
    t.notOk(err)
    t.ok(action)

    activity.get(action.key, function (err, action) {
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

  activity.put(data, function (err, action) {
    t.notOk(err)
    t.ok(action)

    activity.delete(action.key, function (err) {
      t.notOk(err)
      activity.get(action.key, function (err, action) {
        t.ok(err)
        t.end()
      })
    })
  })
})

test('create simple find stream', function (t) {
  activity.find('resource', 'post')
    .on('data', function (data) {
      t.ok(data)
    })
    .on('end', function () {
      t.end()
    })
})

test('create complex filter stream', function (t) {
  var count = 0
  activity.createFilterStream({ resource: ['post'], resourceKey: ['2'] })
    .on('data', function (data) {
      t.ok(data)
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

test('teardown activity', function (t) {
  activity.createReadStream()
    .on('data', function (data) {
      activity.delete(data.key, function (err) {
        t.notOk(err)
      })
    })
    .on('end', function () {
      db.close()
      t.end()
    })
})