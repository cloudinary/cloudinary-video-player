const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const merge = require('webpack-merge');
const minified = require('./minified.config');


module.exports = merge.smart(minified, {
  plugins: [
    new BundleAnalyzerPlugin()
  ]
});

