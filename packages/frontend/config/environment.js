'use strict';

const ADDON_ENV = require('./addons');

module.exports = function (environment) {
  let ENV = {
    modulePrefix: 'emberclear',

    environment,
    rootURL: '/',
    locationType: 'auto', // default

    EmberENV: {
      FEATURES: {},
      EXTEND_PROTOTYPES: false,
    },

    ...ADDON_ENV,

    APP: {
      // Here you can pass flags/options to your application instance
      // when it is created
    },
  };

  if (environment === 'development') {
    // ENV.APP.LOG_RESOLVER = true;
    // ENV.APP.LOG_ACTIVE_GENERATION = true;
    // ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    // ENV.APP.LOG_VIEW_LOOKUPS = true;
    ENV.host = 'https://localhost:4201';
    ENV.SW_DISABLED = process.env.SW_DISABLED;
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.locationType = 'none';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
    ENV.APP.autoboot = false;
    ENV.SW_DISABLED = process.env.SW_DISABLED;

    ENV.percy = {
      // breakpoints from bulma.io
      // mobile: 768,
      // desktop: 1024,
      // widescreen: 1216,
      breakpointsConfig: {
        phone: 540,
        mobile: 768,
        desktop: 1024,
        // widescreen: 1216,
      },
      defaultBreakpoints: [
        'phone',
        'mobile',
        'desktop',
        // 'widescreen',
      ],
    };
  }

  if (environment === 'production') {
    // here you can enable a production-specific feature
    // github pages:
    ENV.host = process.env.HOST || 'https://emberclear.io';
    ENV.rootURL = '/';
    ENV.baseURL = '/';
  }

  return ENV;
};
