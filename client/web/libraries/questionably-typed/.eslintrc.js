'use strict';

const { tsBase } = require('@emberclear/eslint/configs/base');
const { baseConfig: nodeBase } = require('@emberclear/eslint/configs/node');
const { createConfig } = require('@emberclear/eslint/utils');

module.exports = createConfig(
  {
    ...tsBase,
    plugins: [tsBase.plugins, '@typescript-eslint'].flat(),
    files: ['types/**'],
  },
  {
    ...nodeBase,
    files: ['.eslintrc.js'],
  }
);
