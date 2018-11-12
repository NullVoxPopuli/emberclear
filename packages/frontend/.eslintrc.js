module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 2017,
    sourceType: 'module'
  },
  parser: "typescript-eslint-parser",
  plugins: [
    'ember',
    // 'prettier',
    'qunit'
  ],
  extends: [
    'eslint:recommended',
    'plugin:ember/recommended',
    // prettier disabled, because it does not yet support
    // - multiline object destructuring
    // - multiline arrays (for large arrays)
    // 'prettier',
    'plugin:qunit/recommended',
  ],
  env: {
    browser: true
  },
  rules: {
    'semi': ['error', 'always'],
    // 'prettier/prettier': 'error',
    'ember/avoid-leaking-state-in-ember-objects': 'warn',
    'no-console': 'warn',
    'no-cond-assign': 'off',
    'no-useless-escape': 'off',
    'require-yield': 'off',

    // doesn't support deep nesting
    'qunit/no-identical-names': 'warn'
  },
  overrides: [
    {
      files: ['**/*.ts'],
      rules: {
        // Better enforced by TS
        'no-undef': 'off',
        'no-unused-vars': 'off',
        'ember/no-attrs-snapshot': 'off'
      }
    },
    // node files
    {
      files: [
        '.template-lintrc.js',
        'ember-cli-build.js',
        'index.js',
        'src/ember-intl.js',
        'testem.js',
        'blueprints/*/index.js',
        'config/**/*.js',
        'tests/dummy/config/**/*.js'
      ],
      parserOptions: {
        sourceType: 'script',
        ecmaVersion: 2015
      },
      env: {
        browser: false,
        node: true
      }
    }
  ]
};
