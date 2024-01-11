module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          browsers: ['>0.25%', 'not ie 11', 'not op_mini all']
        }
      }
    ]
  ],
  env: {
    test: {
      plugins: ['@babel/plugin-transform-runtime']
    }
  }
};
