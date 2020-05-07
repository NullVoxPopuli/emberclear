let commonRules = {
  // ember specific
  'ember/no-new-mixins': 'off', // don't know what to do about ember-keyboard
  'ember/avoid-leaking-state-in-ember-objects': 'warn',
  'ember/no-incorrect-calls-with-inline-anonymous-functions': 'off', // don't agree with this one.
  'ember/no-ember-testing-in-module-scope': 'off', // needed for tasks atm
  'ember/use-brace-expansion': 'off', // won't matter with @tracked

  // cleanliness & consistency
  'prefer-const': 'off', // const has misleading safety implications
  'no-console': [
    'error',
    { allow: ['debug', 'warn', 'error', 'info', 'group', 'groupEnd', 'groupCollapsed'] },
  ],
  'no-cond-assign': 'off',
  'no-useless-escape': 'off',
  'require-yield': 'off',
  '@typescript-eslint/camelcase': 'off', // temp disable, because route params are snake case
  'getter-return': 'off',

  // over-enforcement of immutability patterns
  'require-atomic-updates': 'warn',

  // tests / qunit
  'qunit/no-identical-names': 'warn', // doesn't support deep nesting

  // prettier
  'prettier/prettier': 'error',
};

module.exports = {
  root: true,
  parser: 'babel-eslint',
  plugins: ['ember', 'prettier', 'qunit', 'decorator-position'],
  extends: [
    'eslint:recommended',
    'plugin:ember/recommended',
    'plugin:qunit/recommended',
    'plugin:decorator-position/ember',
    'prettier',
  ],
  rules: {
    ...commonRules,
  },
  overrides: [
    {
      files: ['**/*.ts'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: 'tsconfig.json',
      },
      plugins: ['ember', 'prettier', 'qunit', '@typescript-eslint'],
      extends: [
        // 'eslint:recommended',
        // 'plugin:ember/recommended',
        // 'plugin:qunit/recommended',
        // 'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
        // 'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'prettier',
        'prettier/@typescript-eslint',
        'plugin:decorator-position/ember',
      ],
      rules: {
        // typescript
        '@typescript-eslint/prefer-optional-chain': 'error',
        '@typescript-eslint/no-unnecessary-condition': 'error',
        '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
        '@typescript-eslint/no-use-before-define': 'off',
        '@typescript-eslint/no-empty-interface': 'off',
        '@typescript-eslint/explicit-member-accessibility': 'off',
        // this one has to be disabled, because not all of my deps use real types
        // ... or, my custom type defs are incorrect
        '@typescript-eslint/interface-name-prefix': 'off', // ['error', 'always'],
        // typescript isn't smart enough to know when we _know_ data will exist
        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off', // implicit return types are fine
        // sometimes we just want to denote that something is async...
        '@typescript-eslint/require-await': 'off',

        // better handled by prettier:
        '@typescript-eslint/indent': 'off',

        ...commonRules,
      },
    },
    {
      files: ['app/services/prism-manager.ts'],
      rules: {
        'no-undef': 'off',
      },
    },
    // types
    {
      files: ['types/**'],
      rules: {
        '@typescript-eslint/no-unused-vars': 'off',
      },
    },
    //tests
    {
      files: ['**/*-test.ts', 'tests/**'],
      env: {
        embertest: true,
      },
      extends: [
        'plugin:qunit/recommended',
      ],
      rules: {
        'ember/no-test-import-export': 'off', // this rule is incomplete
        '@typescript-eslint/no-empty-function': 'off',
        // types of tests might be wrong?
        '@typescript-eslint/no-misused-promises': 'off',
        // doesn't support deep nesting
        'qunit/no-identical-names': 'off',
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
      excludedFiles: ['src/**'],
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
