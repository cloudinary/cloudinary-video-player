const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const { merge } = require('webpack-merge');
const buildConf = require('./build.config');

module.exports = merge(buildConf, {
  plugins: [
    new BundleAnalyzerPlugin()
  ]
});
