var test = require('tape');
var each = require('each-async');

var client = require('../index')({
  host: 'http://127.0.0.1:4243',
  username: 'pizza',
  password: 'pizza'
});


test('create a profile', function (t) {
  var data = {
    account: '1',
    email: 'test@example.com'
  };

  client.profiles.create(data, function (err, res) {
    t.ok(res);
    t.notOk(err);
    t.end();
  });
});


test('update a profile', function (t) {
  var data = {
    account: '2',
    email: 'test@example.com'
  };

  client.profiles.create(data, function (err, res) {
    t.ok(res);
    t.notOk(err);
    res.email = 'wooo@example.com';
    
    client.profiles.update(res, function (err, updated) {
      t.ok(updated.email === 'wooo@example.com');
      t.end();
    });

  });
});


test('get list of profiles', function (t) {
  client.profiles.list(function (err, res) {
    t.ok(res);
    t.notOk(err);
    t.end();
  });
});

test('teardown profiles', function (t) {
  client.profiles.list(function (err, res) {
    each(res, iterator, end)
      
    function iterator (item, i, done) {
      client.profiles.delete(item.key, function (err) {
        t.notOk(err, 'no error when deleting profile')
        done();
      });
    }
    
    function end () {
      t.end()
    }
  })
})