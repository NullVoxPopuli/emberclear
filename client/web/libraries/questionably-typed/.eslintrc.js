'use strict';

const { tsBase } = require('@nullvoxpopuli/eslint-configs/configs/base');
const { baseConfig: nodeBase } = require('@nullvoxpopuli/eslint-configs/configs/node');
const { createConfig } = require('@nullvoxpopuli/eslint-configs/utils');

module.exports = createConfig(
  {
    ...tsBase,
    plugins: [tsBase.plugins, '@typescript-eslint'].flat(),
    files: ['types/**'],
    rules: {
      ...tsBase.rules,
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
  {
    ...nodeBase,
    files: ['.eslintrc.js'],
  }
);
