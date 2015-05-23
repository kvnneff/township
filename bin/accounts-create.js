var levelup = require('level');
var db = levelup(__dirname + '/../db');
var app = require('../lib/index')(db, { site: { title: 'weeee' } });

var opts = {
  login: { basic: { username: 'pizza', password: 'pizza' } },
  value: { email: 'pizza@example.com', username: 'pizza', admin: true }
};

app.accounts.create(opts.value.username, opts, function (err) {
  console.log(err)
});

