'use strict';

module.exports = {
  extends: 'stylelint-config-standard',
  rules: {
    'selector-type-no-unknown': null,
    'no-descending-specificity': null,
    'value-keyword-case': null,
  },
  ignoreFiles: [
    'concat-stats-for/**',
    'dist/**',
    'node_modules/**',
    'public/**',
    '**/*.hbs',
    '**/*.js',
    '**/*.ts',
    '**/*.html',
  ],
};
