const { merge } = require('webpack-merge');
const webpackCommon = require('./common.config');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { isLight } = require('./build-utils');

const env = require('../env');

module.exports = merge(webpackCommon, {
  mode: 'development',

  plugins: [
    new HtmlWebpackPlugin({
      inject: false,
      template: path.resolve(__dirname, '../docs/index.html')
    }),
    new CopyWebpackPlugin({
      patterns: [path.resolve(__dirname, '../docs')]
    })
  ],

  devServer: {
    host: env.devServer.host || 'localhost',
    port: env.devServer.port || 3000,
    open: [isLight ? 'index.html?light=true' : 'index.html'],
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': '*'
    }
  }

});
