const merge = require('webpack-merge');
const webpackDev = require('./dev.config');
module.exports = merge.smart(webpackDev, {
  watch: false,
  devServer: {
    open: false,
    hot: false,
    inline: false
  }
});