//var usage = require('../lib/usage.js')('cat.txt')

module.exports = {
  name: 'accounts',
  command: accounts,
  options: [
    {
      name: 'create',
      boolean: false,
      abbr: 'c'
    },
    {
      name: 'list',
      boolean: false,
      abbr: 'ls'
    }
  ]
}

function accounts (args) {
  console.log(args)
}