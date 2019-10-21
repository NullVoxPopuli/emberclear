module.exports = {
  root: true,
  parser: 'babel-eslint',
  plugins: ['node', 'prettier'],
  extends: [
    'eslint:recommended',
    'prettier',
  ],
  env: {
    mocha: true,
    node: true,
    es6: true,
    browser: true,
  },
  rules: {
    ...require('eslint-plugin-node').configs.recommended.rules,
    'node/no-unpublished-require': 'off', // we live dangerously here
    'node/no-extraneous-require': 'off', // incorrect?

    // cleanliness & consistency
    'prefer-const': 'off', // const has misleading safety implications
    'no-console': ['error', { allow: ['debug', 'warn', 'error', 'info'] }],
    'no-cond-assign': 'off',
    'no-useless-escape': 'off',
    'require-yield': 'off',
    'getter-return': 'off',

    // prettier
    'prettier/prettier': 'error',

  },
};
