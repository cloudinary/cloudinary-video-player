const path = require('path');
const merge = require('webpack-merge');
const webpackCommon = require('./common.config');
const { lightFilenamePart } = require('./build-utils');

// webpack plugins
const DefinePlugin = require('webpack/lib/DefinePlugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const WebpackShellPlugin = require('webpack-shell-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = merge.smart(webpackCommon, {
  bail: false,

  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: `[name]${lightFilenamePart}.js`,
    chunkFilename: `[id]-[chunkhash]${lightFilenamePart}.js`
  },

  plugins: [
    new DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
    new ExtractTextPlugin(`[name]${lightFilenamePart}.min.css`),
    new OptimizeCssAssetsPlugin({ canPrint: true }),
    new WebpackShellPlugin({
      onBuildStart: ['echo "Starting Minification"'],
      // onBuildEnd: ['./node_modules/uglify-js/bin/uglifyjs --ie8 -m -o ./dist/cld-video-player.min.js ./dist/cld-video-player.js']
      onBuildEnd: ['node ./webpack/minify.js']
    })
  ]
});
