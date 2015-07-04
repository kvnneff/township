var test = require('tape')
var fs = require('fs');
var each = require('each-async')
var hammock = require('hammock')
var isEqual = require('is-equal');
var cuid = require('cuid')

var levelup = require('levelup')
var db = levelup('db', { db: require('memdown') })
var accountsModel = require('../model')(db)

var secret = 's3cr3t_Pa55w0rd'
var accountsHandler = require('../handler')(accountsModel, { secret: secret })

// Make a request to get the initial token
var req = hammock.Request({
  method: 'GET',
  headers: {
    'content-type': 'application/json'
  },
  url: '/somewhere'
})
req.end()
var res = hammock.Response()
var payload = { username: "joeblow", admin: true }
res.end()
var tokens = require('../../../lib/tokens')(secret)
var token = tokens.sign(req, payload)


test('get a list of accounts', function (t) {
  var accountsFixture = JSON.parse(JSON.stringify(require('./fixtures/accounts.js')))
  createAccounts(t, accountsFixture, function(expectedAccounts) {
    var request = hammock.Request({
      method: 'GET',
      headers: {
        'content-type': 'application/json'
      },
      url: '/somewhere'
    })
    request.headers.Authorization = 'Bearer ' + token
    request.end('thisbody')

    var response = hammock.Response()
    accountsHandler.index(request, response) // without a callback, accounts is `undefined`

    response.on('end', function (err, data) {
      t.ifError(err)
      t.true(200 === data.statusCode)
      var accounts = JSON.parse(data.body)
      // remove the emails, which have been stripped from the response's accounts
      for (var i = 0; i < expectedAccounts.length; i++) {
        var expectedAccount = expectedAccounts[i]
        delete expectedAccount.email
      }
      t.ok(isEqual(accounts, expectedAccounts))
      t.end()
    });
  })
})


test('delete a single account as non-admin', function (t) {
  req = hammock.Request({
    method: 'GET',
    headers: {
      'content-type': 'application/json'
    },
    url: '/somewhere'
  })
  req.end()
  res = hammock.Response()
  payload = { username: "joeblow" }
  var nonAdminToken = tokens.sign(req, payload)
  res.end()

  var accountsFixture = JSON.parse(JSON.stringify(require('./fixtures/accounts.js')))
  var accountToDelete = accountsFixture[0].login.basic
  var request = hammock.Request({
    method: 'DELETE',
    headers: {
      'content-type': 'application/json'
    },
    url: '/somewhere'
  })
  request.headers.Authorization = 'Bearer ' + nonAdminToken // 'token' is a jwt with login creds
  request.end('thisbody')

  var response = hammock.Response()
  accountsHandler.item(request, response, { params: {key: accountToDelete.key }})

  response.on('end', function (err, data) {
    t.ifError(err)
    t.true(401 === data.statusCode)
    t.end()
  })
})

test('delete a single account', function (t) {
  var accountsFixture = JSON.parse(JSON.stringify(require('./fixtures/accounts.js')))
  var accountToDelete = accountsFixture[0].login.basic
  var request = hammock.Request({
    method: 'DELETE',
    headers: {
      'content-type': 'application/json'
    },
    url: '/somewhere'
  })
  request.headers.Authorization = 'Bearer ' + token // 'token' is a jwt with login creds
  request.end('thisbody')

  var response = hammock.Response()
  accountsHandler.item(request, response, { params: {key: accountToDelete.key }})

  response.on('end', function (err, data) {
    t.ifError(err)
    t.true(200 === data.statusCode)
    t.end()
  })
})

var testAccount
test('POST a single account', function (t) {
  testAccount = { key: cuid(), username: "yup", email: "ok@joeblow.com", password: "poop"}
  var request = hammock.Request({
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    url: '/somewhere'
  })
  request.headers.Authorization = 'Bearer ' + token // 'token' is a jwt with login creds
  request.end(JSON.stringify(testAccount))

  var response = hammock.Response()
  accountsHandler.index(request, response, { params: {key: testAccount.key }})

  response.on('end', function (err, data) {
    t.ifError(err)
    t.true(200 === data.statusCode)
    t.end()
  })
})

// GET the account we just created in POST
test('GET an account', function (t) {
  //var testAccount = { key: cuid(), username: "yup", email: "ok@joeblow.com", password: "poop"}
  var request = hammock.Request({
    method: 'GET',
    headers: {
      'content-type': 'application/json'
    },
    url: '/somewhere'
  })
  request.headers.Authorization = 'Bearer ' + token // 'token' is a jwt with login creds
  request.end(JSON.stringify(testAccount))

  var response = hammock.Response()
  accountsHandler.item(request, response, { params: {key: testAccount.key }})

  response.on('end', function (err, data) {
    t.ifError(err)
    t.true(200 === data.statusCode)
    t.end()
  })
})

// PUT the account we just created in POST
test('PUT an account', function (t) {
  var putAccount = { username: "yup2", email: "ok2@joeblow.com"}
  var request = hammock.Request({
    method: 'PUT',
    headers: {
      'content-type': 'application/json'
    },
    url: '/somewhere'
  })
  request.headers.Authorization = 'Bearer ' + token // 'token' is a jwt with login creds
  request.end(JSON.stringify(putAccount))

  var response = hammock.Response()
  accountsHandler.item(request, response, { params: {key: testAccount.key }})

  response.on('end', function (err, data) {
    t.ifError(err)
    t.true(200 === data.statusCode)
    t.end()
  })
})

function createAccounts(t, accountsData, cb) {
  each(accountsData, iterator, end)
  var expectedAccounts = []

  function iterator(account, i, done) {
    expectedAccounts.push(account.value)

    accountsModel.create(account, function (err, created) {
      t.notOk(err)
      t.ok(created)
      done()
    })
  }

  function end() {
    cb(expectedAccounts)
  }
}

function deleteAccounts(t, accountsData) {
  each(accountsData, iterator, end)

  function iterator(account, i, done) {

    accountsModel.findOne(account.value.username, function (err, accountValue) {
      t.notOk(err)
      t.ok(accountValue)
      accountsModel.delete(accountValue.key, function (err, accountValue) {
        done()
      })
    })
  }

  function end() {
  }
}
