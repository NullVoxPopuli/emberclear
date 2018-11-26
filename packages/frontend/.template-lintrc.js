'use strict';

module.exports = {
  extends: 'recommended',
  rules: {
    'quotes': 'single',
    'no-inline-styles': false,
    'no-bare-strings': {
      whitelist: [
        '(', ')', ',', '.', '&',
        '+', '-', '=', '*', '/',
        '#', '%', '!', '?', ':',
        '[', ']', '{', '}', '<', '>',
        '•', '—', ' ', '|', '@'
      ],
    },
    'no-invalid-interactive': {
      additionalInteractiveTags: [ 'a' ]
    },
    'attribute-indentation': false
  }
};
