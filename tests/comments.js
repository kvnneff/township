var test = require('tape')
var each = require('each-async')

var levelup = require('level')
var db = levelup('./tmp/db-comments')

var comments = require('../lib/comments')(db)

test('create a comment', function (t) {
  var data = {
    post: 'wat',
    account: 'pizza',
    content: 'this is pretty cool'
  }

  comments.create(data, function (err, comment) {
    t.notOk(err)
    t.ok(comment)
    t.end()
  })
})

test('get a comment', function (t) {
  var data = {
    post: 'wat',
    account: 'pizza',
    content: 'this is pretty cool'
  }

  comments.create(data, function (err, createdcomment) {
    t.notOk(err)
    t.ok(createdcomment)
    comments.get(createdcomment.key, function (err, comment) {
      t.notOk(err)
      t.ok(comment)
      t.end()
    })
  })
})

test('update a comment', function (t) {
  var data = {
    post: 'wat',
    account: 'pizza',
    content: 'this is pretty cool'
  }

  comments.create(data, function (err, createdcomment) {
    t.notOk(err)
    t.ok(createdcomment)
    createdcomment.content = 'weeeeeee'
    comments.update(createdcomment, function (err, comment) {
      t.notOk(err)
      t.ok(comment)
      t.equals(comment.content, 'weeeeeee')
      t.end()
    })
  })
})

test('delete a comment', function (t) {
  var data = {
    post: 'wat',
    account: 'pizza',
    content: 'this is pretty cool'
  }

  comments.create(data, function (err, createdcomment) {
    t.notOk(err)
    t.ok(createdcomment)
    comments.delete(createdcomment.key, function (err) {
      t.notOk(err)
      comments.get(createdcomment.key, function (err, comment) {
        t.ok(err)
        t.notOk(comment)
        t.end()
      })
    })
  })
})

test('teardown', function (t) {
  comments.list(function (err, res) {
    each(res, function (item, i, done) {
      comments.delete(item.key, function () {
        done()
      })
    }, function (error) {
      db.close()
      t.end()
    })
  })
})