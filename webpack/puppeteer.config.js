const { merge } = require('webpack-merge');
const devConf = require('./dev.config');

module.exports = merge(devConf, {
  devServer: {
    open: false
  }
});
