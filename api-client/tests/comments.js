var test = require('tape');
var each = require('each-async');

var client = require('../index')({
  host: 'http://127.0.0.1:4243',
  username: 'pizza',
  password: 'pizza'
});


test('create a comment', function (t) {
  var data = {
    post: 'wat',
    account: 'pizza',
    content: 'this is pretty cool'
  };

  client.comments.create(data, function (err, res) {
    t.ok(res);
    t.notOk(err);
    t.end();
  });
});


test('update a comment', function (t) {
  var data = {
    post: 'wat',
    account: 'pizza',
    content: 'this is pretty cool'
  };

  client.comments.create(data, function (err, res) {
    t.ok(res);
    t.notOk(err);
    res.content = 'wooo';

    client.comments.update(res, function (err, updated) {
      t.ok(updated.content === 'wooo');
      t.end();
    });

  });
});


test('get list of comments', function (t) {
  client.comments.list(function (err, res) {
    t.ok(res);
    t.notOk(err);
    t.end();
  });
});


test('teardown comments', function (t) {
  client.comments.list(function (err, res) {
    each(res, iterator, end)
      
    function iterator (item, i, done) {
      client.comments.delete(item.key, function (err) {
        t.notOk(err, 'no error when deleting comment')
        done();
      });
    }
    
    function end () {
      t.end()
    }
  })
})