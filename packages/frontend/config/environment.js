'use strict';

module.exports = function(environment) {
  let ENV = {
    modulePrefix: 'emberclear',
    environment,
    rootURL: '/',
    // locationType: 'auto', // default
    // https://github.com/dollarshaveclub/ember-router-scroll#installation--usage
    locationType: 'router-scroll',
    historySupportMiddleware: true,

    EmberENV: {
      FEATURES: {
        EMBER_MODULE_UNIFICATION: true,
        EMBER_NATIVE_DECORATOR_SUPPORT: true,
        EMBER_METAL_TRACKED_PROPERTIES: true,
        EMBER_GLIMMER_ANGLE_BRACKET_INVOCATION: true,
        EMBER_GLIMMER_ANGLE_BRACKET_NESTED_LOOKUP: true,
        EMBER_GLIMMER_ANGLE_BRACKET_BUILT_INS: true,
      },
      EXTEND_PROTOTYPES: false,
    },

    fontawesome: {
      defaultPrefix: 'fas', // free-and-solid
      icons: {
        'free-brands-svg-icons': ['reddit'],
        'free-solid-svg-icons': [
          'qrcode',
          'user-circle',
          'address-book',
          'sliders-h',
          'sign-out-alt',
          'dot-circle',
          'plus',
          'code',
          'desktop',
          'bed',
          'video',
          'angle-down',
          'angle-up',
          'angle-right',
          'times',
          'times-circle',
          'phone',
          'phone-volume',
          'share',
          'check-circle',
          'exclamation-circle',
          'check',
          'ellipsis-h',
          'globe',
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
      hostWhitelist: ['emberclear.io', /^localhost:\d+$/],
    },
  };

  ENV['ember-a11y-testing'] = {
    componentOptions: {
      turnAuditOff: true,
    },
  };

  if (environment === 'development') {
    // ENV.APP.LOG_RESOLVER = true;
    // ENV.APP.LOG_ACTIVE_GENERATION = true;
    // ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    // ENV.APP.LOG_VIEW_LOOKUPS = true;
    ENV.host = 'http://localhost:4201';
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
