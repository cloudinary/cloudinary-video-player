const { merge } = require('webpack-merge');
const webpackCommon = require('./common.config');
const path = require('path');

delete webpackCommon.output; // overwrite

module.exports = merge(webpackCommon, {
  mode: 'production',

  entry: {
    'cld-video-player': './index.all.js',
    'videoPlayer': './index.es.js',
    'videoPlayerWithProfile': './video-profile-export.es.js'
  },

  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, '../lib'),
    chunkFilename: '[name].js',
    publicPath: '',
    library: {
      type: 'module'
    }
  },

  experiments: {
    outputModule: true
  }
});
