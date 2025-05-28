const { merge } = require('webpack-merge');
const webpackCommon = require('./common.config');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const env = require('../env');

module.exports = merge(webpackCommon, {
  mode: 'development',

  plugins: [
    new HtmlWebpackPlugin({
      inject: false,
      template: path.resolve(__dirname, '../docs/index.html')
    }),
    new CopyWebpackPlugin({
      patterns: [{
        from: path.resolve(__dirname, '../docs'),
        globOptions: {
          ignore: [
            '**/node_modules',
          ],
        },
      }],
    })
  ],

  devServer: {
    port: env.devServer.port || 3000,
    open: ['index.html'],
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': '*'
    }
  }

});
