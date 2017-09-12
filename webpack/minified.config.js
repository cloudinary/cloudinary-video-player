const path = require('path');
const merge = require('webpack-merge');
const webpackCommon = require('./common.config');

// webpack plugins
const DefinePlugin = require('webpack/lib/DefinePlugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const UglifyJsPlugin = require('webpack/lib/optimize/UglifyJsPlugin');

module.exports = merge.smart(webpackCommon, {
  bail: false,
  devtool: 'source-map',

  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: '[name].min.js',
    sourceMapFilename: '[name].min.map',
    chunkFilename: '[id]-[chunkhash].min.js'
  },

  plugins: [
    new DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
    new ExtractTextPlugin('[name].min.css'),
    new UglifyJsPlugin({
      compressor: {
        screw_ie8: true,
        warnings: false
      },
      mangle: true, // NEED TO FIGURE OUT WHY MANGLING DOESN'T WORK.
      output: {
        comments: false,
        screw_ie8: true
      },
      sourceMap: true
    })
  ]
});
