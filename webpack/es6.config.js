const { merge } = require('webpack-merge');
const webpackCommon = require('./common.config');
const path = require('path');

delete webpackCommon.output; // overwrite

module.exports = merge(webpackCommon, {
  mode: 'production',

  entry: {
    'cld-video-player': './index.all.js',
    'videoPlayer/index': './index.es.js'
  },

  output: {
    filename: '[name].js',

    path: path.resolve(__dirname, '../lib'),
    chunkFilename: '[name]/index.js',
    publicPath: '',
    library: {
      type: 'module'
    }
  },

  experiments: {
    outputModule: true
  }
});
