const { merge } = require('webpack-merge');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpackCommon = require('./common.config');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const { isMin, getProfilesPathPattern } = require('./build-utils');

module.exports = merge(webpackCommon, {
  mode: 'production',

  optimization: isMin ? {
    minimize: true,
    minimizer: [
      new CssMinimizerPlugin(),
      new TerserPlugin()
    ]
  } : undefined,

  plugins: [
    new CopyWebpackPlugin({
      patterns: [getProfilesPathPattern(webpackCommon.output.path)]
    })
  ]
});
