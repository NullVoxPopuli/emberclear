'use strict';

const base = {
  // plugin order doesn't matter
  plugins: ['prettier', 'decorator-position'],
  rules: {
    // const has misleading safety implications
    // look in to "liberal let"
    'prefer-const': 'off',

    'no-console': [
      'error',
      { allow: ['debug', 'warn', 'error', 'info', 'group', 'groupEnd', 'groupCollapsed'] },
    ],

    // people should know that no return is undefined in JS
    'getter-return': ['error', { allowImplicit: true }],

    'padding-line-between-statements': [
      'error',
      { blankLine: 'always', prev: '*', next: 'return' },
      { blankLine: 'always', prev: '*', next: 'block-like' },
      { blankLine: 'always', prev: 'block-like', next: '*' },
      { blankLine: 'always', prev: ['const', 'let'], next: '*' },
      { blankLine: 'any', prev: ['const', 'let'], next: ['const', 'let'] },
    ],
  },
};

const baseRulesAppliedLast = {
  // prettier
  'prettier/prettier': 'error',
};

const jsBase = {
  parser: 'babel-eslint',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      legacyDecorators: true,
    },
  },
  env: {
    browser: true,
  },
};

const tsBase = {
  ...base,
  parser: '@typescript-eslint/parser',
  env: {
    browser: true,
  },
  rules: {
    ...base.rules,

    // type imports are removed in builds
    '@typescript-eslint/consistent-type-imports': 'error',
    // this isn't C#
    '@typescript-eslint/interface-name-prefix': 'off',
    // prefer inference
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
  },
};

module.exports = { base, baseRulesAppliedLast, jsBase, tsBase };
