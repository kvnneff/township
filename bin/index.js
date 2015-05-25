var subcommand = require('subcommand')
var levelup = require('level')
var db = levelup(__dirname + '/../db')
var app = require('../lib/index')(db)

var config = {
  root: require('./help'),
  commands: [
    require('./accounts')
  ],
  //defaults: require('./defaults'),
  none: function (args) {
    console.error(args._[0], 'command does not exist')
    console.error('use `township help` to see available commands')
    process.exit(1)
  }
}

var route = subcommand(config)
route(process.argv.slice(2))