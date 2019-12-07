'use strict';

const mergeTrees = require('broccoli-merge-trees');
const EmberApp = require('ember-cli/lib/broccoli/ember-app');
const gitRev = require('git-rev-sync');
const UnwatchedDir = require('broccoli-source').UnwatchedDir;

const { addonConfig, serviceWorkerConfig } = require('./config/build/addons');
const { buildbabelConfig } = require('./config/build/babel');
const { buildStaticTrees } = require('./config/build/static');
const { postcssConfig } = require('./config/build/styles');
const { buildWorkerTrees } = require('./config/build/workers');

module.exports = function(defaults) {
  let environment = EmberApp.env();
  let isProduction = environment === 'production';

  let version = gitRev.short();

  console.info('\n---------------');
  console.info('environment: ', environment);
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

    ...addonConfig,
    ...serviceWorkerConfig({ version }),
    ...buildbabelConfig({ isProduction }),
    ...postcssConfig,
  });

  let funnels = buildStaticTrees();
  let workers = buildWorkerTrees({ isProduction });

  if (!isProduction) {
    app.trees.public = new UnwatchedDir('public');
  }

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

  return mergeTrees([app.toTree(), ...funnels, ...workers]);
};
