'use strict';

module.exports = {
  extends: 'recommended',
  rules: {
    quotes: 'single',
    'link-href-attributes': false, // TODO enable
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

    // might be fixed when the href one is fixed
    'no-invalid-interactive': {
      additionalInteractiveTags: ['a'],
    },
    'attribute-indentation': false,
  },
};
