'use strict';

const Funnel = require('broccoli-funnel');
const mergeTrees = require('broccoli-merge-trees');
const EmberApp = require('ember-cli/lib/broccoli/ember-app');
const gitRev = require('git-rev-sync');
const { Webpack } = require('@embroider/webpack');

const autoprefixer = require('autoprefixer');
const CssImport = require('postcss-import');
const CSSnext = require('postcss-cssnext');
const PresetEnv = require('postcss-preset-env');

// note that by default, the enabled flags on some things
// like minifying by default, already check
// if environment === 'production'
//
// the explicitness is for sanity checking during the
// exploration of bundle / dependency sizes...
module.exports = function(defaults) {
  let disabledAddons = [];
  let environment = EmberApp.env();
  let isProduction = environment === 'production';
  // let isTest = environment === 'test';

  let swDisabled = process.env.SW_DISABLED;
  let version = gitRev.short();

  console.log('\n---------------');
  console.log('environment: ', environment);
  console.log('isProduction: ', isProduction);
  console.log('SW_DISABLED: ', swDisabled);
  console.log('git version: ', version);
  console.log('---------------\n');

  let app = new EmberApp(defaults, {
    hinting: false,
    minifyJS: { enabled: isProduction },
    // TODO: find a way to remove legacy browser support from css
    minifyCSS: { enabled: isProduction },

    sourcemaps: {
      enabled: !isProduction,
      extensions: 'js',
    },

    autoImport: {
      alias: {
        'qr-scanner': 'qr-scanner/qr-scanner.min.js',
      },
      exclude: ['libsodium', 'libsodium-wrappers', 'phoenix', 'showdown', 'qrcode', 'uuid'],
    },

    'ember-cli-babel': {
      includePolyfill: false,
      disablePresetEnv: true,
      disableDebugTooling: isProduction,
      includeExternalHelpers: true,
      // Will not build if uncommented:
      // disableEmberModulesAPIPolyfill: true
      // compileModules: false,
    },

    'ember-test-selectors': {
      strip: isProduction,
    },

    eslint: {
      testGenerator: 'qunit',
      group: true,
      rulesDir: 'eslint-rules',
      extensions: ['js', 'ts'],
    },
    addons: { blacklist: disabledAddons },
    'asset-cache': {
      version,
      include: ['assets/**/*', '**/*.html', 'index.html'],
      exclude: ['.well-known/**/*', 'bundle.html', 'favicon.ico', 'robots.txt'],
    },
    'esw-index': {
      version,
      excludeScope: [/\.well-known/, /bundle.html/, /favicon.ico/, /robots.txt/],
    },

    postcssOptions: {
      compile: {
        enabled: true,
        extension: 'css',
        plugins: [
          {
            module: CssImport,
            options: {
              path: ['node_modules/shoelace-css/source/css'],
            },
          },
          {
            module: CSSnext,
            options: {
              features: {
                rem: false,
              },
            },
          },
          // {
          //   module: PresetEnv,
          //   options: { stage: 0 },
          // },
        ],
      },
      filter: {
        enabled: true,
        plugins: [
          {
            module: autoprefixer,
            options: {
              browsers: ['last 2 versions'], // this will override the config, but just for this plugin
            },
          },
        ],
      },
    },
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

  // markdown
  app.import('node_modules/showdown/dist/showdown.js', {
    using: [{ transformation: 'cjs', as: 'showdown' }],
  });

  // qrcode
  app.import('node_modules/qrcode/build/qrcode.min.js');
  app.import('vendor/shims/qrcode.js');

  // qr-scanner hardcoded this path.... -.-
  let qrScannerWorker = new Funnel('node_modules/qr-scanner/', {
    include: ['qr-scanner-worker.min.js'],
    destDir: '/libraries/qr-scanner/',
  });

  // let tempShoelace = new Funnel('node_modules/shoelace-css/source/css', {
  //   destDir: '/assets/shoelace',
  // });

  // let tempShoelaceDist = new Funnel('node_modules/shoelace-css/dist/', {
  //   include: ['shoelace.css'],
  //   destDir: '/assets/',
  // });

  // let newAppCss = new Funnel('app/styles', {
  //   include: ['app-new.css'],
  //   destDir: '/assets/',
  //   getDestinationPath(relativePath) {
  //     if (relativePath === 'app-new.css') {
  //       return 'emberclear-new.css';
  //     }

  //     return relativePath;
  //   },
  // });

  // uuid
  app.import('node_modules/uuid/index.js', {
    using: [{ transformation: 'cjs', as: 'uuid' }],
  });

  // return require('@embroider/compat').compatBuild(app, Webpack, {
  //   extraPublicTrees: [qrScannerWorker],
  //   // staticAddonTestSupportTrees: true,
  //   // staticAddonTrees: true,
  //   // staticHelpers: true,
  //   // staticComponents: true,
  //   // splitAtRoutes: true,
  //   skipBabel: [],
  // });
  return mergeTrees([
    app.toTree(),
    qrScannerWorker,
    // tempShoelace,
    // newAppCss,
    // tempShoelaceDist
  ]);
};
