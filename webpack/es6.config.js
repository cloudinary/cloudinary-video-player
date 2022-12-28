const { merge } = require('webpack-merge');
const webpackCommon = require('./common.config');
const path = require('path');

delete webpackCommon.output.library; // overwrite

module.exports = merge(webpackCommon, {
  mode: 'production',

  output: {
    path: path.resolve(__dirname, '../lib'),
    library: {
      type: 'module'
    }
  },

  experiments: {
    outputModule: true
  }
});
