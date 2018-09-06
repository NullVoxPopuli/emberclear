'use strict';

const Funnel = require('broccoli-funnel');
const mergeTrees = require('broccoli-merge-trees');
const EmberApp = require('ember-cli/lib/broccoli/ember-app');
const gitRev = require('git-rev-sync');
// const { BroccoliCSSBlocks } = require('@css-blocks/broccoli');

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
  let isTest = environment === 'test';

  let enableSW = process.env.ENABLE_SW;
  let disableServiceWorker = !isProduction && !enableSW;
  let version = gitRev.short();

  console.log('\n---------------');
  console.log('environment: ', environment);
  console.log('isProduction: ', isProduction);
  console.log('ENABLE_SW: ', enableSW);
  console.log('git version: ', version);
  console.log('Service Worker Will Be Disabled: ', disableServiceWorker);
  console.log('---------------\n');

  if (disableServiceWorker) {
     // disable service workers by default for dev and testing
     disabledAddons.push('ember-service-worker');
   }


  let app = new EmberApp(defaults, {
    // eslint slows down the dev-build-debug cycle significantly
    // hinting: false disables linting at build time.
    hinting: isTest,
    tests: isTest,
    // tests: true,
    minifyJS: { enabled: false },
    minifyCSS: { enabled: isProduction },

    'ember-cli-babel': {
      includePolyfill: false,
      disablePresetEnv: true,
      disableDebugTooling: isProduction,
      // Will not build if uncommented:
      // disableEmberModulesAPIPolyfill: true
      // compileModules: false,
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
      enabled: isProduction,
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
    'ember-service-worker': {
      registrationStrategy: 'inline'
      // versionStrategy: 'project-revision'
    },
    // 'esw-index': {
    //   // version,
    //   includeScope: [
    //     /^\/$/,
    //   ]
    // },
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


  // localforage
  app.import('node_modules/localforage/dist/localforage.js');
  app.import('vendor/shims/localforage.js');

  // uuid
  app.import('node_modules/uuid/index.js', {
    using: [{ transformation: 'cjs', as: 'uuid' }]
  });

  // bulma-toast
  app.import('node_modules/bulma/bulma.sass');
  app.import('node_modules/bulma-toast/dist/bulma-toast.min.js');
  app.import('vendor/shims/bulma-toast.js');
  app.import('node_modules/bulma-toast/dist/bulma-toast.min.css');

  return mergeTrees([
    app.toTree(),
    qrScannerWorker
    // new BroccoliCSSBlocks(app.path, {
    //   entry: ['app'],
    //   output: "src/ui/styles/css-blocks.css"
    // })
    // app.toTree()
    // fontTree, fontStyleTree
  ]);
};
