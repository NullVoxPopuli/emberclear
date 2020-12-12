'use strict';

const { configs } = require('@emberclear/eslint');

const config = configs.node();

// TODO: add mocha config
module.exports = {
  ...config,
  env: {
    ...config.env,
    mocha: true,
    browser: true,
    es6: true,
  },
  rules: {
    ...config.rules,
    'no-cond-assign': 'off',
    'no-useless-escape': 'off',
    'require-yield': 'off',
  },
};
