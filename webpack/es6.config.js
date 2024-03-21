const { merge } = require('webpack-merge');
const webpackCommon = require('./common.config');
const path = require('path');

delete webpackCommon.output; // overwrite
delete webpackCommon.devtool; // disable

module.exports = merge(webpackCommon, {
  mode: 'production',

  entry: {
    'cld-video-player': './index.es.js', // default
    'videoPlayer': './index.videoPlayer.js',
    'videoPlayerWithProfile': './index.videoPlayerWithProfile.js',
    'all': './index.all.js'
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
