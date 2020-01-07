'use strict';

const mergeTrees = require('broccoli-merge-trees');
const EmberApp = require('ember-cli/lib/broccoli/ember-app');
const gitRev = require('git-rev-sync');
const UnwatchedDir = require('broccoli-source').UnwatchedDir;

const { addonConfig, serviceWorkerConfig } = require('./config/build/addons');
const { buildBabelConfig } = require('./config/build/babel');
const { buildStaticTrees } = require('./config/build/static');
const { postcssConfig } = require('./config/build/styles');
const { buildWorkerTrees } = require('./config/build/workers');
const crypto = require('crypto');

module.exports = function(defaults) {
  let environment = EmberApp.env();
  let isProduction = environment === 'production';

  let version = gitRev.short();
  let hash = crypto
    .createHash('md5')
    .update(new Date().getTime().toString())
    .digest('hex');

  console.info('\n---------------');
  console.info('environment: ', environment);
  console.info('git version: ', version);
  console.info('asset hash: ', hash);
  console.info('---------------\n');

  let env = {
    isProduction,
    isTest: environment === 'test',
    version,
    hash,
  };

  let app = new EmberApp(defaults, {
    hinting: false,
    minifyJS: { enabled: isProduction },
    // TODO: find a way to remove legacy browser support from css
    minifyCSS: { enabled: isProduction },

    sourcemaps: {
      enabled: true, // !isProduction,
      extensions: 'js',
    },
    fingerprint: {
      customHash: hash,
    },

    emberData: {
      compatWith: '3.16.0',
    },

    ...addonConfig,
    ...serviceWorkerConfig(env),
    ...buildBabelConfig(env),
    ...postcssConfig,
  });

  let additionalTrees = [...buildStaticTrees(env), ...buildWorkerTrees(env)];

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

  return mergeTrees([app.toTree(), ...additionalTrees]);
};
