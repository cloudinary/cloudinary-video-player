const path = require('path');
const merge = require('webpack-merge');
const webpackCommon = require('./common.config');
const env = require('../env');

// Webpack plugins
const HtmlWebpackPlugin = require('html-webpack-plugin');
const DefinePlugin = require('webpack/lib/DefinePlugin');
// const ExtractTextPlugin = require('extract-text-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = merge.smart(webpackCommon, {
  devtool: 'inline-source-map',
  mode: 'development',

  output: {
    path: path.resolve(__dirname, '../dist'),
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
    new MiniCssExtractPlugin({ filename: '[name].css' }),
    new HtmlWebpackPlugin({
      inject: false,
      template: path.resolve(__dirname, '../index.html')
    }),
    new CopyWebpackPlugin([{ from: '../docs' }])
  ],

  devServer: {
    host: env.devServer.host || 'localhost',
    port: env.devServer.port || 3000,
    open: true,
    historyApiFallback: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': '*'
    }
  },
  watchOptions: {
    aggregateTimeout: 300,
    poll: 7000,
    ignored: [path.resolve(__dirname, '../node_modules')]
  }
});
