'use strict';

module.exports = {
  extends: 'octane',
  rules: {
    quotes: 'single',
    'no-inline-styles': false, // TODO enable :(
    'no-implicit-this': true,
    'no-bare-strings': {
      // ugh
      whitelist: [
        '&nbsp;',
        '(',
        ')',
        ',',
        '.',
        '&',
        '+',
        '-',
        '=',
        '*',
        '/',
        '#',
        '%',
        '!',
        '?',
        ':',
        '[',
        ']',
        '{',
        '}',
        '<',
        '>',
        '•',
        '—',
        ' ',
        '|',
        '@',
      ],
    },

    'attribute-indentation': false,
  },
};
