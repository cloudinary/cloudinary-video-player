//const env = require('../env.js');
module.exports = {
  server: {
    command: './node_modules/webpack-dev-server/bin/webpack-dev-server.js --config webpack/puppeteer.config.js',
    port: 3000,
    launchTimeout: 200000
  },
  launch: {
    headless: false
  },
  browserContext: 'default'

};