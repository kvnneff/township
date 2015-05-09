var test = require('tape');
var each = require('each-async');

var levelup = require('level');
var db = levelup('./db');

var app = require('../lib/index')(db, { site: { title: 'weeee' } });

test('teardown', function (t) {

});