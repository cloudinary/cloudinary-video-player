const { merge } = require('webpack-merge');
const webpackConfig = require('./es6.config');
const path = require('path');

delete webpackConfig.entry; // overwrite

module.exports = merge(webpackConfig, {

  entry: {
    'light': './index.es.js'
  }

});
