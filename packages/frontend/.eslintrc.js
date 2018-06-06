module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 2017,
    sourceType: 'module'
  },
  plugins: [
    'ember',
    'prettier',
    'qunit'
  ],
  extends: [
    'eslint:recommended',
    'plugin:ember/recommended',
    'prettier',
    'plugin:qunit/recommended',
  ],
  env: {
    browser: true
  },
  rules: {
    'prettier/prettier': 'error',
    'ember/avoid-leaking-state-in-ember-objects': 'warn'
  },
  overrides: [
    // node files
    {
      files: [
        'ember-cli-build.js',
        'index.js',
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
