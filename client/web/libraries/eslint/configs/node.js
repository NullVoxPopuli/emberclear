'use strict';

const baseConfig = {
  env: {
    browser: false,
    node: true,
  },
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'script',
    ecmaVersion: 2018,
  },
  plugins: ['node'],
  rules: {
    ...require('eslint-plugin-node').configs.recommended.rules,
    'node/no-unpublished-require': 'off', // we live dangerously here
    'node/no-extraneous-require': 'off', // incorrect?
  },
};

const nodeJS = {
  ...baseConfig,
  files: ['**/*.js'],
};

module.exports = { baseConfig, node: [nodeJS] };
