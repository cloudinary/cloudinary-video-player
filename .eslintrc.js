module.exports = {
  env: {
    browser: true,
    node: true,
    commonjs: true,
    es6: true,
    jest: true
  },
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },

  globals: {
    VERSION: true,
    page: true,
    browser: true
  },
  rules: {
    indent: ['error', 2, { SwitchCase: 1 }],
    'linebreak-style': ['error', 'unix'],
    quotes: ['error', 'single'],
    semi: ['warn', 'always'],
    'no-console': 'off',
    'no-unused-vars': 'warn',
    'no-useless-escape': 'off'
  }
};
