const merge = require('webpack-merge');
const webpackDev = require('./dev.config');


module.exports = merge.smart(webpackDev, {
  devServer: {
    open: false
  }
});