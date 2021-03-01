const Compiler = require('./compiler')

function webpack(config) {
  return new Compiler(config)
}

module.exports = webpack
