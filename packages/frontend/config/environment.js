'use strict';

console.log('HOST: ', process.env.HOST, 'CI: ', process.env.CI);

module.exports = function(environment) {
  let ENV = {
    'ember-resolver': {
      features: {
        EMBER_RESOLVER_MODULE_UNIFICATION: true,
        EMBER_GLIMMER_ANGLE_BRACKET_INVOCATION: true,
      },
    },
    modulePrefix: 'emberclear',
    environment,
    rootURL: '/',
    // locationType: 'auto', // default
    // https://github.com/dollarshaveclub/ember-router-scroll#installation--usage
    locationType: 'router-scroll',
    historySupportMiddleware: true,

    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. 'with-controller': true
        'ember-module-unification': true,
        'ember-glimmer-angle-bracket-invocation': true,
        'ember-metal-tracked-properties': true,
        EMBER_GLIMMER_ANGLE_BRACKET_INVOCATION: true,
      },
      EXTEND_PROTOTYPES: false,
    },

    i18n: {
      defaultLocale: 'en-us',
    },

    fontawesome: {
      defaultPrefix: 'fas', // free-and-solid
      icons: {
        'free-solid-svg-icons': [
          'qrcode', 'user-circle',
          'address-book', 'sliders-h', 'sign-out-alt',
          'dot-circle',
          'plus',
          'code', 'desktop', 'bed', 'video',
          'angle-down', 'angle-up', 'times',
          'phone', 'phone-volume', 'share',
          'check-circle', 'exclamation-circle',
          'check', 'ellipsis-h'
        ],
      },
    },

    routerScroll: {
      scrollElement: '#scrollContainer',
    },

    APP: {
      // Here you can pass flags/options to your application instance
      // when it is created
    },

    fastboot: {
      hostWhitelist: [
        'emberclear.io',
        /^localhost:\d+$/,
      ],
    }
  };

  if (environment === 'development') {
    // ENV.APP.LOG_RESOLVER = true;
    // ENV.APP.LOG_ACTIVE_GENERATION = true;
    // ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    // ENV.APP.LOG_VIEW_LOOKUPS = true;
    // Ember.run.backburner.DEBUG = true;
    ENV.host = 'http://localhost:4201';
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.locationType = 'none';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
    ENV.APP.autoboot = false;
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
