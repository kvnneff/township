module.exports = function (app) {
  app.accounts.list().on('data', console.log)
}