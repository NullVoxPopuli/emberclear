'use strict';

const { configs } = require('@emberclear/eslint');

const config = configs.ember();

module.exports = {
  ...config,
  overrides: [
    ...config.overrides,
    {
      files: ['app/services/prism-manager.ts'],
      rules: {
        'no-undef': 'off',
      },
    },
  ],
};
