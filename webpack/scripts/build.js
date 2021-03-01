const webpack = require('../lib/index')
const config = require('../webpack.config.js')

const compier = webpack(config)

compier.run()