const { merge } = require('webpack-merge');
const webpackCommon = require('./common.config');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const BannerPlugin = require('webpack/lib/BannerPlugin');

const env = require('../env');

const VERSION = JSON.stringify(process.env.npm_package_version);

module.exports = merge(webpackCommon, {
  mode: 'development',
  devtool: 'source-map',

  plugins: [
    new BannerPlugin({
      banner: `/*!
 * Cloudinary Video Player v${VERSION.replace(/"/g, '')}
 * Built on ${new Date().toISOString()}
 * https://github.com/cloudinary/cloudinary-video-player
 */`,
      entryOnly: false,
      raw: true
    }),
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
    allowedHosts: 'all',
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': '*'
    }
  }

});
