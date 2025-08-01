const { merge } = require('webpack-merge');
const webpackCommon = require('./common.config');
const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

delete webpackCommon.output; // overwrite

const outputPath = path.resolve(__dirname, '../lib');

module.exports = merge(webpackCommon, {
  mode: 'production',

  entry: {
    'cld-video-player': './index.es.js', // default
    'videoPlayer': './index.videoPlayer.js',
    'player': './index.player.js',
    'all': './index.all.js'
  },

  output: {
    filename: '[name].js',
    path: outputPath,
    chunkFilename: '[name].js',
    publicPath: '',
    library: {
      type: 'module'
    },
    chunkLoadingGlobal: 'cloudinaryVideoPlayerChunkLoading'
  },

  plugins: [
    new CopyWebpackPlugin({
      patterns: [{
        from: path.resolve(__dirname, '../src/config/configSchema.json'),
        to: `${outputPath}/schema.json`
      }]
    })
  ],

  experiments: {
    outputModule: true
  }
});
