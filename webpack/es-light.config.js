const { merge } = require('webpack-merge');
const webpackConfig = require('./es6.config');
const path = require('path');

delete webpackConfig.entry; // overwrite

module.exports = merge(webpackConfig, {

  entry: {
    'index': './index.es.js'
  },

  output: {
    path: path.resolve(__dirname, '../lib/light'),
  }

});
