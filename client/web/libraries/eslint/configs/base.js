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

// Node doesn't yet support modules import/export
const scriptBase = {
  plugins: [...base.plugins, 'import'],
  rules: {
    ...base.rules,
    ...require('eslint-plugin-import/config/errors').rules,
    ...require('eslint-plugin-import/config/warnings').rules,
    'import/order': ['error'],
    'import/no-unassigned-import': ['error'],
    'import/exports-last': ['error'],
    'import/no-duplicates': ['error'],
    'import/newline-after-import': ['error'],
  },
};

const moduleBase = {
  ...base,
};

const moduleImports = {
  plugins: ['simple-import-sort'],
  rules: {
    'simple-import-sort/imports': [
      'error',
      {
        // This notation is bonkers
        groups: [
          // Side effect imports.
          ['^\\u0000'],

          // framework imports
          ['^ember$', '^@glimmer', '^@ember', '^ember-cli-htmlbars', '^qunit', '^ember-qunit'],

          // Packages.
          // Things that start with a letter (or digit or underscore), or `@` followed by a letter.
          ['^@?\\w'],

          // Absolute imports and other imports such as Vue-style `@/foo`.
          // Anything not matched in another group.
          ['^'],

          // monorepo apps
          ['^emberclear', '^pinochle'],

          // monorepo packages
          ['^@emberclear'],

          // Relative imports.
          // Anything that starts with a dot.
          ['^\\.'],

          // Type imports
          ['^.+\\u0000$'],
        ],
      },
    ],
    'simple-import-sort/exports': 'error',
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

    // Eliminate worthless warnings
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],

    // Use real types
    '@typescript-eslint/no-explicit-any': 'error',
    // Maximum strictness
    '@typescript-eslint/no-non-null-assertion': 'error',
  },
};

module.exports = { moduleImports, moduleBase, scriptBase, baseRulesAppliedLast, jsBase, tsBase };
