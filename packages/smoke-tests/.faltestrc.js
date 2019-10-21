'use strict';

module.exports = {
  options: {
    targets: {
      default: 'default',
      list: ['default', 'local', 'ember', 'pull-request'],
    },
    browsers: {
      firefox: {
        args: [
          // TODO
        ],
      },
      chrome: {
        args: [
          process.env.CI ? '--no-sandbox' : null,
          '--window-size=1280,720', // 720p
          '--ignore-certificate-errors',
          '--auto-open-devtools-for-tabs'
        ].filter(Boolean)
      }
    }
  },
  globs: ['tests/**/*-test.js'],
};
