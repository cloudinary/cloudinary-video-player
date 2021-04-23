const { merge } = require('webpack-merge');
const webpackDev = require('./dev.config');
module.exports = merge(webpackDev, {
  watch: false,
  devServer: {
    open: false,
    hot: false,
    inline: false
  }
});