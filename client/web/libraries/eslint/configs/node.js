'use strict';

const { scriptBase, baseRulesAppliedLast } = require('./base');

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
  plugins: ['node', ...scriptBase.plugins],
  rules: {
    ...require('eslint-plugin-node').configs.recommended.rules,
    ...scriptBase.rules,

    'node/no-unpublished-require': 'off', // we live dangerously here
    'node/no-extraneous-require': 'off', // incorrect?

    ...baseRulesAppliedLast,
  },
};

const nodeJS = {
  ...baseConfig,
  files: ['**/*.js'],
};

module.exports = { baseConfig, node: [nodeJS] };
