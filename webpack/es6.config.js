const { merge } = require('webpack-merge');
const webpackCommon = require('./common.config');
const path = require('path');

delete webpackCommon.output; // overwrite
delete webpackCommon.devtool; // disable

module.exports = merge(webpackCommon, {
  mode: 'production',

  entry: {
    'videoPlayer': './index.es.js', // default
    'videoPlayerWithProfile': './video-player-profile.js',
    'cld-video-player': './index.all.js' // all
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
