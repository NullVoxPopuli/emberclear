'use strict';

const config = require('@emberclear/config/.template-lintrc');

module.exports = {
  ...config,
  rules: {
    ...config.rules,
    'no-inline-styles': false, // TODO enable :(
  },
};
