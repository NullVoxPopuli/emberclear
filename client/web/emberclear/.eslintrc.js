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
    {
      files: ['app/**/*.ts', 'tests/**/*.ts'],
      rules: {
        // This project didn't start in TypeScript
        '@typescript-eslint/no-explicit-any': 'warn',
        '@typescript-eslint/no-non-null-assertion': 'warn',
      },
    },
  ],
};
