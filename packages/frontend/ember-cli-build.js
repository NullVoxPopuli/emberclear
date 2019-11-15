'use strict';

const Funnel = require('broccoli-funnel');
const mergeTrees = require('broccoli-merge-trees');
const EmberApp = require('ember-cli/lib/broccoli/ember-app');
const gitRev = require('git-rev-sync');

const autoprefixer = require('autoprefixer');
const CssImport = require('postcss-import');

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

  let swDisabled = process.env.SW_DISABLED;
  let version = gitRev.short();

  console.info('\n---------------');
  console.info('environment: ', environment);
  console.info('isProduction: ', isProduction);
  console.info('SW_DISABLED: ', swDisabled);
  console.info('git version: ', version);
  console.info('---------------\n');

  let app = new EmberApp(defaults, {
    hinting: false,
    minifyJS: { enabled: isProduction },
    // TODO: find a way to remove legacy browser support from css
    minifyCSS: { enabled: isProduction },

    sourcemaps: {
      enabled: true, // !isProduction,
      extensions: 'js',
    },

    autoImport: {
      alias: {
        qrcode: 'qrcode/build/qrcode.min.js',
        'qr-scanner': 'qr-scanner/qr-scanner.min.js',
        uuid: 'uuid/index.js',
      },
      exclude: ['libsodium', 'libsodium-wrappers'],
    },

    // was for enabling dynamic import.
    babel: {
      plugins: [require.resolve('ember-auto-import/babel-plugin')],
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
      strip: false, // isProduction,
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
    'esw-cache-fallback': {
      patterns: ['https://(.+)/open_graph?(.+)'],
    },

    postcssOptions: {
      compile: {
        enabled: true,
        extension: 'css',
        plugins: [
          {
            module: CssImport,
            options: {
              path: ['node_modules/shoelace-css/source/css', 'app/styles/component-styles'],
            },
          },
          {
            module: require('postcss-cssnext'),
            options: {
              features: {
                colorFunction: {
                  preserveCustomProps: false,
                },
                customProperties: {
                  preserve: true,
                },
                rem: false,
              },
            },
          },
          // {
          //   module: require('postcss-preset-env'),
          //   options: {
          //     stage: 0,
          //     // browsers: 'last 2 versions',
          //     // preserve: false,
          //     features: {
          //       // abandoned
          //       'color-function': {
          //         preserveCustomProps: true,
          //       },
          //       // stage 0
          //       // 'nesting-rules': true,
          //       // stage 1
          //       // 'custom-media-queries': true,
          //       // stage 2
          //       'color-mod-function': {
          //         preserveCustomProps: true,
          //       }, // color()
          //       // 'color-functional-notation': false,
          //       // stage 4
          //       // stage 3
          //       'custom-properties': {
          //         preserve: true,
          //       },
          //     },
          //   },
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

  // qr-scanner hardcoded this path.... -.-
  let qrScannerWorker = new Funnel('node_modules/qr-scanner/', {
    include: ['qr-scanner-worker.min.js'],
    destDir: '/libraries/qr-scanner/',
  });

  let prism = new Funnel('node_modules/prismjs', {
    include: ['prism.js', 'themes/*', 'plugins/**', 'components/**'],
    destDir: '/prismjs/',
  });

  // Embroider is too buggy atm
  // return require('@embroider/compat').compatBuild(app, require('@embroider/webpack').Webpack, {
  //   extraPublicTrees: [qrScannerWorker],
  //   // staticAddonTestSupportTrees: true,
  //   // staticAddonTrees: true,
  //   // staticHelpers: true,
  //   // staticComponents: true,
  //   // splitAtRoutes: true,
  //   // skipBabel: [],
  // });

  return mergeTrees([app.toTree(), qrScannerWorker, prism]);
};
