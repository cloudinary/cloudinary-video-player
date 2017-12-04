const path = require('path');
const merge = require('webpack-merge');
const webpackCommon = require('./common.config');
const { lightFilenamePart } = require('./build-utils');

// webpack plugins
const DefinePlugin = require('webpack/lib/DefinePlugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const UglifyJsPlugin = require('webpack/lib/optimize/UglifyJsPlugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = merge.smart(webpackCommon, {
  bail: false,

  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: `[name]${lightFilenamePart}.min.js`,
    sourceMapFilename: `[name]${lightFilenamePart}.min.map`,
    chunkFilename: `[id]-[chunkhash]${lightFilenamePart}.min.js`
  },

  plugins: [
    new DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
    new ExtractTextPlugin(`[name]${lightFilenamePart}.min.css`),
    new OptimizeCssAssetsPlugin({ canPrint: true }),
    // new BundleAnalyzerPlugin(),
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
      sourceMap: false
    })
  ]
});
