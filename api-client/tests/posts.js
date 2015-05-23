var test = require('tape');
var each = require('each-async');

var client = require('./index')({
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

  client.posts.create(account, function (err, res) {
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

  client.accounts.create(account, function (err, res) {
    t.ok(res);
    t.notOk(err);
    res.title = 'wooo';
    
    client.accounts.update(res, function (err, updated) {
      t.ok(updated.title === 'wooo');
      t.end();
    });

  });
});


test('get list of accounts', function (t) {
  client.accounts.list(function (err, res) {
    t.ok(res);
    t.notOk(err);
    t.end();
  });
});


test('get list of admin accounts', function (t) {
  client.accounts.list({ admin: true }, function (err, res) {
    t.ok(res);
    t.notOk(err);
    t.end();
  });
});


test('teardown', function (t) {
  client.accounts.list(function (err, res) {
    each(res, iterator, end)
      
    function iterator (item, i, done) {
      if (item.username !== 'pizza') {
        client.accounts.delete(item.username, function (err) {
          t.notOk(err, 'no error when deleting account')
          done();
        });
      }
    }
    
    function end () {
      t.end()
    }
  })
})