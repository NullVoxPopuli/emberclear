'use strict';

module.exports = {
  extends: 'recommended',
  rules: {
    'quotes': 'single',
    'no-inline-styles': false,
    'no-bare-strings': true,
    'no-invalid-interactive': {
      additionalInteractiveTags: [ 'a' ]
    }
  }
};
