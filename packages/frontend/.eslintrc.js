const tsLint = {
  parserOptions: {
    project: require.resolve('./tsconfig.json'),
  },
  plugins: ['@typescript-eslint'],
  extends: ['plugin:@typescript-eslint/recommended', 'prettier', 'prettier/@typescript-eslint'],
  rules: {
    'no-console': [
      'error',
      { allow: ['debug', 'warn', 'error', 'info', 'group', 'groupEnd', 'groupCollapsed'] },
    ],
    'getter-return': ['error', { allowImplicit: true }],
    'prefer-const': 'off', // const has misleading safety implications

    // typescript
    '@typescript-eslint/prefer-optional-chain': 'error',
    '@typescript-eslint/no-use-before-define': 'off',
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/no-floating-promises': 'error',

    'prettier/prettier': 'error',
  },
};

module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['ember', 'prettier', 'qunit', 'decorator-position'],
  extends: [
    'eslint:recommended',
    'plugin:ember/recommended',
    'plugin:qunit/recommended',
    'plugin:decorator-position/ember',
    'prettier',
  ],
  rules: {
    'prefer-const': 'off', // const has misleading safety implications

    // prettier
    'prettier/prettier': 'error',
  },
  overrides: [
    // weird ones
    {
      files: ['app/services/prism-manager.ts'],
      ...tsLint,
      rules: {
        ...tsLint.rules,
        'no-undef': 'off',
      },
    },
    // the main code
    {
      files: ['app/**/*.ts', 'types/**'],
      ...tsLint,
      rules: {
        ...tsLint.rules,

        // ember specific
        'ember/no-new-mixins': 'off', // don't know what to do about ember-keyboard
      },
    },
    //tests
    {
      files: ['**/*-test.ts', 'tests/**'],
      ...tsLint,
      env: {
        embertest: true,
      },
      rules: {
        ...tsLint.rules,
        // doesn't support deep nesting
        'qunit/no-identical-names': 'warn',
        'ember/no-test-import-export': 'off', // this rule is incomplete
        '@typescript-eslint/no-empty-function': 'off',
        '@typescript-eslint/no-floating-promises': 'off',
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
        'scripts/**/*.js',
      ],
      env: {
        browser: false,
        node: true,
      },
      plugins: ['node'],
      rules: Object.assign({}, require('eslint-plugin-node').configs.recommended.rules, {
        'node/no-unpublished-require': 'off', // we live dangerously here
        'node/no-extraneous-require': 'off', // incorrect?
      }),
    },
  ],
};
