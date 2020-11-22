const path = require('path');
const merge = require('webpack-merge');
const webpackCommon = require('./common.config');
const { lightFilenamePart } = require('./build-utils');

// webpack plugins
const DefinePlugin = require('webpack/lib/DefinePlugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = merge.smart(webpackCommon, {
  bail: false,

  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: `[name]${lightFilenamePart}.min.js`,
    chunkFilename: `[id]-[chunkhash]${lightFilenamePart}.min.js`
  },
  optimization: optimization(),

  plugins: [
    new DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
    new MiniCssExtractPlugin({filename: `[name]${lightFilenamePart}.min.css`}),
    new OptimizeCssAssetsPlugin({ canPrint: true })
  ]
});

function optimization() {
  if (process.env.NODE_ENV !== 'production') {
    return;
  }

  return {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          ecma: 6,
          compress: {
            drop_debugger: true,
            drop_console: true
          },
          output: {
            comments: false,
            beautify: false
          }
        }
      })
    ]
  };
}


