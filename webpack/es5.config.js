const path = require('path');
const merge = require('webpack-merge');
const webpackCommon = require('./common.config');
const { lightFilenamePart } = require('./build-utils');

// webpack plugins
const DefinePlugin = require('webpack/lib/DefinePlugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = merge.smart(webpackCommon, {
  bail: false,
  devtool: 'source-map',

  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: `[name]${lightFilenamePart}.js`,
    sourceMapFilename: `[name]${lightFilenamePart}.map`,
    chunkFilename: `[id]-[chunkhash]${lightFilenamePart}.js`
  },

  plugins: [
    new DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
    new ExtractTextPlugin('[name].css')
  ]
});
