'use strict';

module.exports = {
  options: {
    targets: {
      default: 'default',
      list: ['default', 'local', 'pull-request'],
    },
  },
  globs: ['tests/**/*-test.js'],
};
