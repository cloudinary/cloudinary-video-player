const path = require('path');
const ESLintPlugin = require('eslint-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const DefinePlugin = require('webpack/lib/DefinePlugin');
const { minFilenamePart } = require('./build-utils');

const VERSION = JSON.stringify(process.env.npm_package_version);

console.log('Current version: ' + VERSION);

const webpackConfig = {
  context: path.resolve(__dirname, '../src'),

  entry: {
    'cld-video-player': {
      import: './index.umd.js',
      library: { name: 'cloudinary-video-player', type: 'umd' }
    },
    'cld-video-player-lazy': {
      import: './index.lazy.js',
      library: { name: 'cloudinary-video-player', type: 'umd' }
    }
  },

  output: {
    filename: `[name]${minFilenamePart}.js`,
    chunkFilename: `[name]${minFilenamePart}.js`,
    path: path.resolve(__dirname, '../dist'),
    publicPath: 'auto',
    chunkLoadingGlobal: 'cloudinaryVideoPlayerChunkLoading'
  },

  optimization: {
    splitChunks: {
      cacheGroups: {
        defaultVendors: false,
        styles: {
          name: 'styles',
          type: 'css/mini-extract',
          chunks: 'all',
          enforce: true
        }
      }
    }
  },

  resolve: {
    extensions: ['.js', '.scss'],
    modules: ['node_modules'],
    alias: {
      '~': path.resolve(__dirname, '../src'),
      'video.js': path.resolve(__dirname, '../node_modules/video.js/dist/alt/video.core.js'),
      'video.root.js': path.resolve(__dirname, '../node_modules/video.js')
    }
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: [/node_modules/, /\/docs\/es-modules\//],
        use: [
          {
            loader: 'babel-loader'
          },
          'webpack-conditional-loader'
        ]
      },
      {
        test: /\.s?css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader'
        ],
      },
      {
        test: /\.svg/,
        type: 'asset/inline'
      },
      {
        test: path.resolve(__dirname, '../node_modules/video.js'),
        loader: 'expose-loader',
        options: {
          exposes: {
            globalName: 'videojs',
            override: true
          }
        }
      }
    ]
  },

  plugins: [
    new ESLintPlugin(),
    new DefinePlugin({ VERSION }),
    new MiniCssExtractPlugin({
      filename: `cld-video-player${minFilenamePart}.css`
    })
  ]
};

module.exports = webpackConfig;
