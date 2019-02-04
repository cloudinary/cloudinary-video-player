const path = require('path');
const merge = require('webpack-merge');
const webpackCommon = require('./common.config');
let { lightFilenamePart } = require('./build-utils');

// webpack plugins
const DefinePlugin = require('webpack/lib/DefinePlugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = (env, argv) => {
  lightFilenamePart = argv.mode === 'development' ? lightFilenamePart : lightFilenamePart + '.min';

  return merge.smart(webpackCommon, {
    bail: false,
    mode: 'production',

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
      new MiniCssExtractPlugin('[name].css')
    ]
  });
};