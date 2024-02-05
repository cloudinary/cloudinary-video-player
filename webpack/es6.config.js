const { merge } = require('webpack-merge');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpackCommon = require('./common.config');
const path = require('path');
const { getProfilesPathPattern } = require('./build-utils');

delete webpackCommon.output; // overwrite

const outputPath = path.resolve(__dirname, '../lib');

module.exports = merge(webpackCommon, {
  mode: 'production',

  entry: {
    'cld-video-player': './index.all.js',
    'videoPlayer': './index.es.js'
  },

  output: {
    filename: '[name].js',
    path: outputPath,
    chunkFilename: '[name].js',
    publicPath: '',
    library: {
      type: 'module'
    }
  },

  plugins: [
    new CopyWebpackPlugin({
      patterns: [getProfilesPathPattern(outputPath)]
    })
  ],

  experiments: {
    outputModule: true
  }
});
