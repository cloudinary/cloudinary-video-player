const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const { merge } = require('webpack-merge');
const minified = require('./minified.config');


module.exports = merge(minified, {
  plugins: [
    new BundleAnalyzerPlugin()
  ]
});
