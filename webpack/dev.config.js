const path = require('path');
const merge = require('webpack-merge');
const webpackCommon = require('./common.config');
const env = require('../env');

// webpack plugins
const HtmlWebpackPlugin = require('html-webpack-plugin');
const DefinePlugin = require('webpack/lib/DefinePlugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = merge.smart(webpackCommon, {
  devtool: 'inline-source-map',

  output: {
    path: path.resolve(__dirname, '../docs/dist'),
    filename: '[name].js',
    sourceMapFilename: '[name].map',
    chunkFilename: '[id]-chunk.js',
    publicPath: '/'
  },

  plugins: [
    new DefinePlugin({
      'process.env': {
        NODE_ENV: '"development"'
      }
    }),
    new ExtractTextPlugin('[name].css'),
    new HtmlWebpackPlugin({
      inject: false,
      template: path.resolve(__dirname, '../docs/index.html'),
      favicon: path.resolve(__dirname, '../docs/favicon.ico')
    }),
    new CopyWebpackPlugin([{ from: '../docs/examples' }]),
    new CopyWebpackPlugin([{ from: '../docs/assets' }])
  ],

  devServer: {
    host: env.devServer.host || 'localhost',
    port: env.devServer.port || 3000,
    open: true,
    historyApiFallback: true,
  },
  watchOptions: {
    aggregateTimeout: 300,
    poll: 7000,
    ignored: [path.resolve(__dirname, '../node_modules')]
  }
});
