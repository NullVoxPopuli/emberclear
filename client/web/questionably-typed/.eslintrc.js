'use strict';

const { base, simpleTypescript: typescript, nodeOverrides } = require('@emberclear/config/eslint');

module.exports = {
  ...base,
  overrides: [
    {
      files: ['@ember/**/*.d.ts'],
      ...typescript,
    },
    nodeOverrides,
    // disabled linting
    {
      files: ['ember__test-helpers/index.d.ts', 'ember__component/**/*.d.ts'],
      plugins: [],
      extends: [],
      rules: {
        'no-unused-vars': 'off',
        'prettier/prettier': 'off',
      },
    },
  ],
};
