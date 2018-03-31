const path      = require('path')
const modPath   = require('app-module-path')


modPath.addPath(path.join(__dirname, '../local_modules'))
modPath.addPath(path.join(__dirname, '../src'))

global.$ = require('jquery')
global.window = {}
global.log = global.console.log
// global.console.log = () => {}
global.localStorage = {
  getItem: () => {},
  setItem: () => {},
}


require('babel-polyfill')
require('babel-register')
