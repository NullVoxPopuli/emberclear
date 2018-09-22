'use strict';

module.exports = {
  extends: 'recommended',
  rules: {
    'no-bare-strings': true,
    'no-invalid-interactive': {
      additionalInteractiveTags: [ 'a' ]
    }
  }
};
