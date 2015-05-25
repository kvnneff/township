module.exports = function (app, cmd, options) {
  var key = cuid()
  var data = {
    login: { basic: { uuid: key, password: process.argv[4] } },
    value: { email: process.argv[3], username: process.argv[2] }
  }

  app.accounts.create(key, data, function (err) {
    if (err) return console.log ('error creating account\n', err)
    console.log('account created for', username)
  })
}