const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const DefinePlugin = require('webpack/lib/DefinePlugin');
const ProvidePlugin = require('webpack/lib/ProvidePlugin');
const ver = require('./versioning');

let VERSION = (process.env.deploy === 'true') ? JSON.stringify(ver.getNextVersion()) : JSON.stringify(require('../package.json').version);
console.log('Current version: ' + VERSION);

module.exports = {
  context: path.resolve(__dirname, '../src'),

  entry: {
    'cld-video-player': './index.js'
  },
  performance: {
    maxEntrypointSize: 800000,
    maxAssetSize: 800000
  },

  output: {
    libraryTarget: 'umd',
    library: 'cloudinaryVideoPlayer'
  },

  externals: {
    'cloudinary-core': {
      commonjs: 'cloudinary-core',
      commonjs2: 'cloudinary-core',
      amd: 'cloudinary-core',
      root: 'cloudinary'
    },
    lodash: {
      commonjs: 'lodash',
      commonjs2: 'lodash',
      amd: '_',
      root: '_'
    }
  },

  resolve: {
    extensions: ['.js', '.scss'],
    modules: [path.resolve(__dirname, '../src'), 'node_modules'],
    alias: {
      'video.js': path.resolve(__dirname, '../node_modules/video.js'),
      'webworkify': 'webworkify-webpack2',
      'videojs-contrib-ads': path.resolve(__dirname, '../node_modules/videojs-contrib-ads/dist/videojs-contrib-ads.min.js'),
      'videojs-ima': path.resolve(__dirname, '../node_modules/videojs-ima/dist/videojs-ima.min.js')
    }
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader'
          },
          'webpack-conditional-loader',
          'eslint-loader'
        ]
      },
      {
        test: /\.json$/,
        use: 'json-loader'
      },
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader'
        ]
      },
      {
        test: /\.(jpg|png|gif)$/,
        use: ['url-loader']
      },
      {
        test: /\.woff$/,
        use: 'url-loader?limit=7000&mimetype=application/font-woff&name=fonts/[name].[ext]'
      },
      {
        test: /\.woff2$/,
        use: 'url-loader?limit=7000&mimetype=application/font-woff2&name=fonts/[name].[ext]'
      },
      {
        test: /\.[ot]tf$/,
        use: 'url-loader?limit=7000&mimetype=application/octet-stream&name=fonts/[name].[ext]'
      },
      {
        test: /\.eot$/,
        use: 'url-loader?limit=7000&mimetype=application/vnd.ms-fontobject&name=fonts/[name].[ext]'
      },
      {
        test: /\.svg$/,
        use: 'url-loader?limit=7000&mimetype=image/svg+xml&name=fonts/[name].[ext]'
      },
      {
        test: /\.(mp4|webm)$/,
        use: 'url-loader?limit=10000'
      },
      {
        test: path.resolve(__dirname, '../node_modules/video.js'),
        use: [
          {
            loader: 'expose-loader',
            options: 'videojs'
          }
        ]
      }
    ]
  },

  node: {
    fs: 'empty',
    net: 'empty'
  },

  plugins: [
    new ProvidePlugin({
      'window.videojs': 'video.js'
    }),
    new DefinePlugin({ VERSION })
  ]
};
