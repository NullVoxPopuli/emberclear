module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['ember', 'prettier', 'qunit', '@typescript-eslint', 'decorator-position'],
  extends: [
    'eslint:recommended',
    'plugin:ember/recommended',
    'plugin:qunit/recommended',
    'plugin:decorator-position/ember',
    'plugin:@typescript-eslint/recommended',
    'prettier',
    'prettier/@typescript-eslint',
  ],
  rules: {
    // ember specific
    'ember/no-new-mixins': 'off', // don't know what to do about ember-keyboard

    // cleanliness & consistency
    'prefer-const': 'off', // const has misleading safety implications
    'no-console': [
      'error',
      { allow: ['debug', 'warn', 'error', 'info', 'group', 'groupEnd', 'groupCollapsed'] },
    ],
    'getter-return': ['error', { allowImplicit: true }],

    // typescript
    '@typescript-eslint/prefer-optional-chain': 'error',
    '@typescript-eslint/no-use-before-define': 'off',
    '@typescript-eslint/interface-name-prefix': 'off', // ['error', 'always'],

    // prettier
    'prettier/prettier': 'error',
  },
  overrides: [
    {
      files: ['app/services/prism-manager.ts'],
      rules: {
        'no-undef': 'off',
      },
    },
    //tests
    {
      files: ['**/*-test.ts', 'tests/**'],
      rules: {
        'ember/no-test-import-export': 'off', // this rule is incomplete
        '@typescript-eslint/no-empty-function': 'off',
      },
    },
    // node files
    {
      files: [
        '.ember-cli.js',
        '.eslintrc.js',
        '.prettierrc.js',
        '.template-lintrc.js',
        'stylelint.config.js',
        'ember-cli-build.js',
        'index.js',
        'src/ember-intl.js',
        'testem.js',
        'blueprints/*/index.js',
        'config/**/*.js',
        'tests/dummy/config/**/*.js',
        'faltest/**/*.js',
        '.faltestrc.js',
      ],
      env: {
        browser: false,
        node: true,
      },
      plugins: ['node'],
      rules: Object.assign({}, require('eslint-plugin-node').configs.recommended.rules, {
        '@typescript-eslint/camelcase': 'off',
        '@typescript-eslint/no-var-requires': 'off',
        'node/no-unpublished-require': 'off', // we live dangerously here
        'node/no-extraneous-require': 'off', // incorrect?
      }),
    },
  ],
};
