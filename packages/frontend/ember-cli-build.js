'use strict';

const Funnel = require('broccoli-funnel');
const mergeTrees = require('broccoli-merge-trees');
const EmberApp = require('ember-cli/lib/broccoli/ember-app');
const gitRev = require('git-rev-sync');

// note that by default, the enabled flags on some things
// like minifying, and prember, by default, already check
// if environment === 'production'
//
// the explicitness is for sanity checking during the
// exploration of bundle / dependency sizes...
module.exports = function(defaults) {
  let disabledAddons = [];
  let environment = EmberApp.env();
  let isProduction = environment === 'production';

  let swDisabled = process.env.SW_DISABLED;
  let version = gitRev.short();

  console.log('\n---------------');
  console.log('environment: ', environment);
  console.log('isProduction: ', isProduction);
  console.log('SW_DISABLED: ', swDisabled);
  console.log('git version: ', version);
  console.log('---------------\n');


  let app = new EmberApp(defaults, {
    // eslint slows down the dev-build-debug cycle significantly
    // hinting: false disables linting at build time.
    hinting: false,
    minifyJS: { enabled: false },
    minifyCSS: { enabled: isProduction },

    babel: {
      // sourceMaps: 'inline'
    //   plugins: [
    //     ['@babel/plugin-syntax-decorators', { legacy: true }]
    //   ]
    },

    sourcemaps: {
      enabled: !isProduction,
      extensions: 'js'
    },

    'ember-cli-babel': {
      includePolyfill: false,
      disablePresetEnv: true,
      disableDebugTooling: isProduction,
      // Will not build if uncommented:
      // disableEmberModulesAPIPolyfill: true
      // compileModules: false,
    },

    'ember-test-selectors': {
      strip: isProduction
    },

    // autoprefixer: { sourcemap: false },

    eslint: {
      testGenerator: 'qunit',
      group: true,
      rulesDir: 'eslint-rules',
      extensions: ['js', 'ts'],
    },
    addons: { blacklist: disabledAddons },
    prember: {
      urls: [
        '/',
        '/faq',
        '/chat',
        '/setup',
        '/login',
      ],
    },
    treeShaking: {
      enabled: true,
    },
    'asset-cache': {
      version,
      include:[
        'assets/**/*',
        '**/*.html',
        'index.html',
      ]
    },
    'esw-cache-fallback': {
      version,
      patterns: [
        '/',
      ],
    },
    'ember-app-shell': {},
  });

  // Use `app.import` to add additional libraries to the generated
  // output files.
  //
  // If you need to use different assets in different
  // environments, specify an object as the first parameter. That
  // object's keys should be the environment name and the values
  // should be the asset to use in that environment.
  //
  // If the library that you are including contains AMD or ES6
  // modules that you would like to import into your application
  // please specify an object with the list of modules as keys
  // along with the exports of each module as its value.

  // phoenix sockets!
  app.import('node_modules/phoenix/assets/js/phoenix.js', {
    using: [{ transformation: 'cjs', as: 'phoenix' }],
  });

  // libsodium
  app.import('node_modules/libsodium/dist/modules/libsodium.js');
  app.import('node_modules/libsodium/dist/modules/libsodium-wrappers.js');
  app.import('vendor/shims/libsodium.js');
  app.import('vendor/shims/libsodium-wrappers.js');

  // markdown
  app.import('node_modules/showdown/dist/showdown.js', {
    using: [{ transformation: 'cjs', as: 'showdown' }]
  });

  // qrcode
  app.import('node_modules/qrcode/build/qrcode.min.js');
  app.import('vendor/shims/qrcode.js');

  // qrcode scanner
  app.import('node_modules/qr-scanner/qr-scanner.min.js', {
    using: [{ transformation: 'es6', as: 'qr-scanner' }]
  });

  // qr-scanner hardcoded this path.... -.-
  var qrScannerWorker = new Funnel(
    'node_modules/qr-scanner/', {
      include: ['qr-scanner-worker.min.js'],
      destDir: '/libraries/qr-scanner/'
    }
  );

  // uuid
  app.import('node_modules/uuid/index.js', {
    using: [{ transformation: 'cjs', as: 'uuid' }]
  });

  // bulma-toast
  app.import('node_modules/bulma/bulma.sass');

  return mergeTrees([
    app.toTree(),
    qrScannerWorker
  ]);
};
