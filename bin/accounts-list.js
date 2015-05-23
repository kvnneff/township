var levelup = require('level');
var db = levelup(__dirname + '/../db');
var app = require('../lib/index')(db, { site: { title: 'weeee' } });

app.accounts.list().on('data', console.log)
