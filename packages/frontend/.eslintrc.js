module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['ember', 'prettier', 'qunit', '@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:ember/recommended',
    'plugin:qunit/recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
    'prettier/@typescript-eslint',
  ],
  rules: {
    // ember specific
    'ember/avoid-leaking-state-in-ember-objects': 'warn',
    'ember/no-incorrect-calls-with-inline-anonymous-functions': 'off', // don't agree with this one.
    'ember/no-ember-testing-in-module-scope': 'off', // needed for tasks atm
    'ember/use-brace-expansion': 'off', // won't matter with @tracked

    // cleanliness & consistency
    'prefer-const': 'off', // const has misleading safety implications
    'no-console': ['error', { allow: ['debug', 'warn', 'error', 'info'] }],
    'no-cond-assign': 'off',
    'no-useless-escape': 'off',
    'require-yield': 'off',
    '@typescript-eslint/camelcase': 'off', // temp disable, because route params are snake case
    'getter-return': 'off',

    // tests / qunit
    'qunit/no-identical-names': 'warn', // doesn't support deep nesting

    // typescript
    //
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

    // prettier
    'prettier/prettier': 'error',

    // better handled by prettier:
    '@typescript-eslint/indent': 'off',
  },
  overrides: [
    // {
    //   files: ['**/*.ts'],
    //   rules: {
    //     // Better enforced by TS
    //     'no-undef': 'off',
    //     'no-unused-vars': 'off',
    //     'ember/no-attrs-snapshot': 'off'
    //   }
    // },
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
      rules: {
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
        'ember-cli-build.js',
        'index.js',
        'src/ember-intl.js',
        'testem.js',
        'blueprints/*/index.js',
        'config/**/*.js',
        'tests/dummy/config/**/*.js',
      ],
      excludedFiles: ['src/**'],
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
