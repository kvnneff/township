var test = require('tape');
var each = require('each-async');

var client = require('../index')({
  host: 'http://127.0.0.1:4243',
  username: 'pizza',
  password: 'pizza'
});


test('create a post', function (t) {
  var data = {
    title: 'This is a post',
    url: 'http://example.com/the-post',
    account: 'example'
  };

  client.posts.create(data, function (err, res) {
    t.ok(res);
    t.notOk(err);
    t.end();
  });
});


test('update a post', function (t) {
  var data = {
    title: 'This is a post',
    url: 'http://example.com/the-post',
    account: 'example'
  };

  client.posts.create(data, function (err, res) {
    t.ok(res);
    t.notOk(err);
    res.title = 'wooo';

    client.posts.update(res, function (err, updated) {
      t.ok(updated.title === 'wooo');
      t.end();
    });

  });
});


test('get list of posts', function (t) {
  client.posts.list(function (err, res) {
    t.ok(res);
    t.notOk(err);
    t.end();
  });
});


test('teardown posts', function (t) {
  client.posts.list(function (err, res) {
    each(res, iterator, end)
      
    function iterator (item, i, done) {
      client.posts.delete(item.key, function (err) {
        t.notOk(err, 'no error when deleting post')
        done();
      });
    }
    
    function end () {
      t.end()
    }
  })
})