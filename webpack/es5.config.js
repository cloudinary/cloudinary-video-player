const path = require('path');
const { merge } = require('webpack-merge');
const webpackCommon = require('./common.config');
let { lightFilenamePart } = require('./build-utils');

// webpack plugins
const DefinePlugin = require('webpack/lib/DefinePlugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = (env, argv) => {
  lightFilenamePart = argv.mode === 'development' ? lightFilenamePart : lightFilenamePart + '.min';

  return merge(webpackCommon, {
    bail: false,
    mode: 'production',
    output: {
      path: path.resolve(__dirname, '../dist'),
      filename: `[name]${lightFilenamePart}.js`,
      chunkFilename: `[id]-[chunkhash]${lightFilenamePart}.js`
    },
    optimization: optimization(argv.mode),
    plugins: plugins(argv.mode)
  });
};

function optimization(mode) {
  if (mode !== 'production') {
    return;
  }

  return {
    minimize: true,
    minimizer: [
      new OptimizeCssAssetsPlugin({}),
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

function plugins(mode) {
  const plugins = [
    new DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(mode)
      }
    }),
    new MiniCssExtractPlugin({
      filename: `[name]${lightFilenamePart}.css`,
      chunkFilename: '[id].css'
    })
  ];

  if (mode !== 'development') {
    plugins.push(new OptimizeCssAssetsPlugin({}));
  }

  return plugins;
}
