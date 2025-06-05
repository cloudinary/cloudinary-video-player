const { merge } = require('webpack-merge');
const webpackCommon = require('./common.config');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const BannerPlugin = require('webpack/lib/BannerPlugin');
const { isMin } = require('./build-utils');

const VERSION = JSON.stringify(process.env.npm_package_version);

module.exports = merge(webpackCommon, {
  mode: 'production',

  optimization: isMin ? {
    minimize: true,
    minimizer: [
      new CssMinimizerPlugin(),
      new TerserPlugin({
        terserOptions: {
          format: {
            comments: /^!/
          }
        },
        extractComments: false
      })
    ]
  } : undefined,

  plugins: [
    new BannerPlugin({
      banner: `/*!
 * Cloudinary Video Player v${VERSION.replace(/"/g, '')}
 * Built on ${new Date().toISOString()}
 * https://github.com/cloudinary/cloudinary-video-player
 */`,
      entryOnly: false,
      raw: true
    })
  ]
});
