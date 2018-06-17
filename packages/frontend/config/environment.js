'use strict';

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
    locationType: 'auto',
    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. 'with-controller': true
        'ember-module-unification': true,
        'ember-glimmer-angle-bracket-invocation': true,
        'ember-metal-tracked-properties': true,
        EMBER_GLIMMER_ANGLE_BRACKET_INVOCATION: true,
      },
      EXTEND_PROTOTYPES: {
        // Prevent Ember Data from overriding Date.parse.
        Date: false,
      },
    },

    i18n: {
      defaultLocale: 'en-us',
    },

    APP: {
      // Here you can pass flags/options to your application instance
      // when it is created
    },

    'ember-bulma': {
      // exclude everything by default
      except: [
        'bulma-button',
        'bulma-checkbox',
        'bulma-column',
        'bulma-columns',
        'bulma-container',
        'bulma-control',
        'bulma-footer',
        'bulma-header',
        'bulma-header-menu',
        'bulma-hero-content',
        'bulma-hero-footer',
        'bulma-hero-header',
        'bulma-hero',
        'bulma-input',
        'bulma-menu',
        'bulma-menu-list',
        'bulma-message-body',
        'bulma-message-header',
        'bulma-message',
        'bulma-modal-background',
        'bulma-modal-close',
        'bulma-modal',
        'bulma-nav-center',
        'bulma-nav',
        'bulma-nav-left',
        'bulma-nav-right',
        'bulma-nav-toggle',
        'bulma-notification',
        'bulma-panel-block',
        'bulma-panel',
        'bulma-panel-tabs',
        'bulma-progress',
        'bulma-radio',
        'bulma-section',
        'bulma-select',
        'bulma-table',
        'bulma-tabs',
        'bulma-tag',
        'bulma-textarea',
      ],
    },
  };

  if (environment === 'development') {
    // ENV.APP.LOG_RESOLVER = true;
    // ENV.APP.LOG_ACTIVE_GENERATION = true;
    // ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    // ENV.APP.LOG_VIEW_LOOKUPS = true;
    // Ember.run.backburner.DEBUG = true;
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
    ENV.rootURL = process.env.ROOT_URL || '/emberclear/';
    ENV.baseURL = '/';
  }

  return ENV;
};
