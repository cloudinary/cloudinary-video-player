const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const DefinePlugin = require('webpack/lib/DefinePlugin');
const { lightFilenamePart, minFilenamePart } = require('./build-utils');

const VERSION = JSON.stringify(process.env.npm_package_version);

console.log('Current version: ' + VERSION);

const webpackConfig = {
  context: path.resolve(__dirname, '../src'),

  entry: {
    'cld-video-player': './index.js',
  },

  output: {
    filename: `[name]${lightFilenamePart}${minFilenamePart}.js`,
    chunkFilename: `[name]${lightFilenamePart}${minFilenamePart}.js`,
    path: path.resolve(__dirname, '../dist'),
    publicPath: 'auto',
    library: {
      name: 'cloudinary-video-player',
      type: 'umd'
    }
  },

  optimization: {
    splitChunks: {
      cacheGroups: {
        defaultVendors: false
      }
    }
  },

  devtool: 'source-map',

  resolve: {
    extensions: ['.js', '.scss'],
    modules: [path.resolve(__dirname, '../src'), 'node_modules'],
    alias: {
      'video.js': process.env.WEBPACK_BUILD_LIGHT
        ? path.resolve(__dirname, '../node_modules/video.js/dist/alt/video.core.js')
        : path.resolve(__dirname, '../node_modules/video.js'),
      'video.root.js': path.resolve(__dirname, '../node_modules/video.js')
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
        test: /\.scss$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader']
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
    new DefinePlugin({ VERSION }),
    new MiniCssExtractPlugin({ filename: `[name]${lightFilenamePart}${minFilenamePart}.css` })
  ]
};

module.exports = webpackConfig;
