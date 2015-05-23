var test = require('tape')
var each = require('each-async')

var levelup = require('level')
var db = levelup('./tmp/db-posts')

var posts = require('../lib/posts')(db)

test('create a post', function (t) {
  var data = {
    title: 'This is a post',
    url: 'http://example.com/the-post',
    account: 'example'
  }

  posts.create(data, function (err, post) {
    t.notOk(err)
    t.ok(post)
    t.end()
  })
})

test('get a post', function (t) {
  var data = {
    title: 'This is a post',
    url: 'http://example.com/the-post',
    account: 'example'
  }

  posts.create(data, function (err, createdPost) {
    t.notOk(err)
    t.ok(createdPost)
    posts.get(createdPost.key, function (err, post) {
      t.notOk(err)
      t.ok(post)
      t.end()
    })
  })
})

test('update a post', function (t) {
  var data = {
    title: 'This is a post',
    url: 'http://example.com/the-post',
    account: 'test'
  }

  posts.create(data, function (err, createdPost) {
    t.notOk(err)
    t.ok(createdPost)
    createdPost.title = 'weeeeeee'
    posts.update(createdPost, function (err, post) {
      t.notOk(err)
      t.ok(post)
      t.equals(post.title, 'weeeeeee')
      t.end()
    })
  })
})

test('delete a post', function (t) {
  var data = {
    title: 'This is a post',
    url: 'http://example.com/the-post',
    account: 'example'
  }

  posts.create(data, function (err, createdPost) {
    t.notOk(err)
    t.ok(createdPost)
    posts.delete(createdPost.key, function (err) {
      t.notOk(err)
      posts.get(createdPost.key, function (err, post) {
        t.ok(err)
        t.notOk(post)
        t.end()
      })
    })
  })
})

test('find post by account', function (t) {
  posts.find('account', 'test')
    .on('data', function (post) {
      t.ok(post)
    })
    .on('end', function () {
      t.end()
    })
})

test('posts have tags', function (t) {
  t.notOk(true, 'make posts have tags')
  t.end()
})

test('add comments to a post', function (t) {
  var data = {
    title: 'This is a post',
    url: 'http://example.com/the-post',
    account: 'example'
  }
  
  posts.create(data, function (err, post) {
    var c = {
      post: post.key,
      account: 'pizza',
      content: 'this is pretty cool'
    }

    posts.comments.create(c, function (err, comment) {
      t.notOk(err)
      t.ok(comment)
      t.end()
    })
  })
})

test('create a comment with a post', function (t) {
  var data = {
    title: 'This is a post',
    url: 'http://example.com/the-post',
    account: 'example',
    comments: [
      {
        account: 'pizza',
        content: 'this is pretty cool'
      }
    ]
  }
  
  posts.create(data, function (err, post) {
    var c = {
      post: post.key,
      account: 'pizza',
      content: 'this is pretty cool'
    }

    posts.comments.create(c, function (err, comment) {
      t.notOk(err)
      t.ok(comment)
      posts.createCommentStream(post.key)
        .on('data', function (data) {
          t.ok(data)
        })
        .on('end', function () {
          t.end()
        })
    })
  })
})

test('find comments of a post', function (t) {
  var data = {
    title: 'This is a post',
    url: 'http://example.com/the-post',
    account: 'example'
  }

  posts.create(data, function (err, post) {
    var c = {
      post: post.key,
      account: 'pizza',
      content: 'this is pretty cool'
    }

    posts.comments.create(c, function (err, comment) {
      posts.createCommentStream(post.key)
        .on('data', function (data) {
          t.ok(data)
        })
        .on('end', function () {
          t.end()
        })
    })
  })
})

test('teardown', function (t) {
  posts.list(function (err, res) {
    each(res, function (item, i, done) {
      posts.delete(item.key, function () {
        done()
      })
    }, function (error) {
      db.close()
      t.end()
    })
  })
})
