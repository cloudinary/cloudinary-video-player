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
    'player': {
      import: './index.js',
      library: { name: 'cloudinary-video-player', type: 'umd' }
    },
    'player-full': {
      import: './index.full.js',
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
        exclude: [/node_modules/],
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
          {
            loader: 'sass-loader',
            options: {
              sassOptions: {
                charset: false
              }
            }
          }
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
      filename: `player${minFilenamePart}.css`
    }),
    {
      apply(compiler) {
        compiler.hooks.afterEmit.tapAsync('CopyAliases', (compilation, callback) => {
          const fs = compiler.outputFileSystem;
          const outputPath = compilation.outputOptions.path;
          const copies = [
            [`player${minFilenamePart}.css`, `cld-video-player${minFilenamePart}.css`],
            [`player-full${minFilenamePart}.js`, `cld-video-player${minFilenamePart}.js`]
          ];
          let pending = copies.length;
          copies.forEach(([src, dest]) => {
            fs.readFile(path.join(outputPath, src), (err, data) => {
              if (err) return --pending === 0 ? callback() : null;
              fs.writeFile(path.join(outputPath, dest), data, () => {
                if (--pending === 0) callback();
              });
            });
          });
        });
      }
    }
  ]
};

module.exports = webpackConfig;
