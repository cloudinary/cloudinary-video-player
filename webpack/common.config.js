const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const DefinePlugin = require('webpack/lib/DefinePlugin');
const VERSION = JSON.stringify(require('../package.json').version);

module.exports = {
  context: path.resolve(__dirname, '../src'),

  entry: {
    'cld-video-player': './index.js'
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
      'video.js$': path.resolve(__dirname, '../node_modules/video.js'),
      'videojs-contrib-media-sources$': path.resolve(__dirname, '../node_modules/videojs-contrib-media-sources'),
      'webworkify': 'webworkify-webpack2'
    }
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['es2015']
            }
          },
          'eslint-loader'
        ]
      },
      {
        test: /\.json$/,
        use: 'json-loader'
      },
      {
        test: /\.scss$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            'css-loader?sourceMap&importLoaders=2',
            'resolve-url-loader',
            `sass-loader?outputStyle=expanded&sourceMap&sourceMapContents&includePaths[]=${path.resolve(__dirname, '../node_modules/compass-mixins/lib')}`
          ]
        })
      },
      {
        test: /\.(jpg|png|gif)$/,
        use: ['url-loader']
      },
      {
        test: /\.woff$/,
        use: 'url-loader?mimetype=application/font-woff'
      },
      {
        test: /\.woff2$/,
        use: 'url-loader?mimetype=application/font-woff2'
      },
      {
        test: /\.[ot]tf$/,
        use: 'url-loader?mimetype=application/octet-stream'
      },
      {
        test: /\.eot$/,
        use: 'url-loader?mimetype=application/vnd.ms-fontobject'
      },
      {
        test: /\.svg$/,
        use: 'url-loader?mimetype=image/svg+xml'
      },
      {
        test: /\.(mp4|webm)$/,
        use: 'url-loader?limit=10000'
      }
    ]
  },

  node: {
    fs: 'empty',
    net: 'empty'
  },

  plugins: [
    new DefinePlugin({ VERSION })
  ]
};
