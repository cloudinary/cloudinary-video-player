module.exports = {
  "env": {
    "browser": true,
    "node": true,
    "commonjs": true,
    "es6": true
  },
  "extends": "eslint:recommended",
  "parser": "babel-eslint",
  "parserOptions": {
    "ecmaFeatures": {
      "experimentalObjectRestSpread": true,
      "jsx": true
    },
    "sourceType": "module"
  },
  "plugins": [
  ],
  "rules": {
    "accessor-pairs": "warn",
    "array-bracket-spacing": [
      "warn",
      "never"
    ],
    "array-callback-return": "warn",
    "arrow-body-style": "warn",
    "arrow-parens": "off",
    "arrow-spacing": [
      "warn",
      {
        "after": true,
        "before": true
      }
    ],
    "block-scoped-var": "warn",
    "block-spacing": "warn",
    "brace-style": [
      "warn",
      "1tbs"
    ],
    "callback-return": "warn",
    "camelcase": "off",
    "comma-dangle": "warn",
    "comma-spacing": [
      "warn",
      {
        "after": true,
        "before": false
      }
    ],
    "comma-style": [
      "warn",
      "last"
    ],
    "complexity": "warn",
    "computed-property-spacing": [
      "warn",
      "never"
    ],
    "consistent-return": "off",
    "consistent-this": "off",
    "curly": "warn",
    "default-case": "warn",
    "dot-location": [
      "warn",
      "property"
    ],
    "dot-notation": "warn",
    "eol-last": "off",
    "eqeqeq": "warn",
    "func-names": [
      "off",
      "never"
    ],
    "func-style": [
      "off",
      "expression"
    ],
    "generator-star-spacing": "warn",
    "global-require": "warn",
    "guard-for-in": "warn",
    "handle-callback-err": "warn",
    "id-blacklist": "warn",
    "id-length": "off",
    "id-match": "warn",
    "indent": ["warn", 2, {"SwitchCase": 1}],
    "init-declarations": "warn",
    "jsx-quotes": [
      "warn",
      "prefer-double"
    ],
    "key-spacing": "warn",
    "keyword-spacing": [
      "warn",
      {
        "after": true,
        "before": true
      }
    ],
    "linebreak-style": [
      "warn",
      "unix"
    ],
    "lines-around-comment": "warn",
    "max-depth": "warn",
    "max-len": "off",
    "max-lines": "off",
    "max-nested-callbacks": "warn",
    "max-params": "off",
    "max-statements": "off",
    "max-statements-per-line": "warn",
    "new-cap": "warn",
    "new-parens": "warn",
    "newline-after-var": "off",
    "newline-before-return": "off",
    "newline-per-chained-call": "off",
    "no-alert": "warn",
    "no-array-constructor": "warn",
    "no-bitwise": "warn",
    "no-caller": "warn",
    "no-catch-shadow": "warn",
    "no-confusing-arrow": "off",
    "no-continue": "warn",
    "no-console": "off",
    "no-div-regex": "warn",
    "no-duplicate-imports": "warn",
    "no-else-return": "off",
    "no-empty-function": "warn",
    "no-eq-null": "warn",
    "no-eval": "warn",
    "no-extend-native": "warn",
    "no-extra-bind": "warn",
    "no-extra-label": "warn",
    "no-extra-parens": "off",
    "no-floating-decimal": "warn",
    "no-implicit-globals": "warn",
    "no-implied-eval": "warn",
    "no-inline-comments": "off",
    "no-invalid-this": "off",
    "no-iterator": "warn",
    "no-label-var": "warn",
    "no-labels": "warn",
    "no-lone-blocks": "warn",
    "no-lonely-if": "warn",
    "no-loop-func": "warn",
    "no-magic-numbers": "off",
    "no-mixed-operators": "off",
    "no-mixed-requires": "warn",
    "no-multi-spaces": "warn",
    "no-multi-str": "warn",
    "no-multiple-empty-lines": "warn",
    "no-negated-condition": "off",
    "no-nested-ternary": "warn",
    "no-new": "warn",
    "no-new-func": "warn",
    "no-new-object": "warn",
    "no-new-require": "warn",
    "no-new-wrappers": "warn",
    "no-octal-escape": "warn",
    "no-param-reassign": "off",
    "no-path-concat": "warn",
    "no-plusplus": "off",
    "no-process-env": "off",
    "no-process-exit": "warn",
    "no-proto": "warn",
    "no-prototype-builtins": "warn",
    "no-restricted-globals": "warn",
    "no-restricted-imports": "warn",
    "no-restricted-modules": "warn",
    "no-restricted-syntax": "warn",
    "no-return-assign": "warn",
    "no-script-url": "warn",
    "no-self-compare": "warn",
    "no-sequences": "warn",
    "no-shadow": "off",
    "no-shadow-restricted-names": "warn",
    "no-spaced-func": "warn",
    "no-sync": "warn",
    "no-ternary": "off",
    "no-throw-literal": "warn",
    "no-trailing-spaces": "warn",
    "no-undef-init": "warn",
    "no-undefined": "off",
    "no-underscore-dangle": "off",
    "no-unmodified-loop-condition": "warn",
    "no-unneeded-ternary": "warn",
    "no-unused-expressions": "warn",
    "no-unused-vars": "warn",
    "no-use-before-define": "off",
    "no-useless-call": "warn",
    "no-useless-computed-key": "warn",
    "no-useless-concat": "warn",
    "no-useless-constructor": "warn",
    "no-useless-escape": "off",
    "no-useless-rename": "warn",
    "no-var": "warn",
    "no-void": "warn",
    "no-warning-comments": "off",
    "no-whitespace-before-property": "warn",
    "no-with": "warn",
    "object-curly-spacing": [
      "warn",
      "always"
    ],
    "object-property-newline": [
      "warn",
      {
        "allowMultiplePropertiesPerLine": true
      }
    ],
    "one-var": "off",
    "one-var-declaration-per-line": "warn",
    "operator-assignment": "warn",
    "operator-linebreak": "warn",
    "padded-blocks": "off",
    "prefer-arrow-callback": "off",
    "prefer-const": "off",
    "prefer-reflect": "off",
    "prefer-rest-params": "warn",
    "prefer-spread": "warn",
    "prefer-template": "warn",
    "quote-props": "off",
    "quotes": [
      "warn",
      "single"
    ],
    "no-this-before-super": "off",
    "radix": "warn",
    "rest-spread-spacing": "warn",
    "semi": ["warn", "always"],
    "semi-spacing": "warn",
    "sort-imports": "off",
    "sort-vars": "warn",
    "space-before-blocks": "warn",
    "space-before-function-paren": "off",
    "space-in-parens": [
      "warn",
      "never"
    ],
    "space-infix-ops": "warn",
    "space-unary-ops": "warn",
    "spaced-comment": [
      "warn",
      "always"
    ],
    "strict": "warn",
    "template-curly-spacing": [
      "warn",
      "never"
    ],
    "unicode-bom": [
      "warn",
      "never"
    ],
    "valid-jsdoc": "off",
    "vars-on-top": "warn",
    "wrap-iife": "warn",
    "wrap-regex": "off",
    "yield-star-spacing": "warn",
    "yoda": [
      "warn",
      "never"
    ]
  }
};
