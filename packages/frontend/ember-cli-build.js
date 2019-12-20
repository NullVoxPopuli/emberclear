'use strict';

var Funnel = require('broccoli-funnel');
const mergeTrees = require('broccoli-merge-trees');
const EmberApp = require('ember-cli/lib/broccoli/ember-app');
const gitRev = require('git-rev-sync');
const UnwatchedDir = require('broccoli-source').UnwatchedDir;

const { addonConfig, serviceWorkerConfig } = require('./config/build/addons');
const { buildbabelConfig } = require('./config/build/babel');
const { buildStaticTrees } = require('./config/build/static');
const { postcssConfig } = require('./config/build/styles');
const { buildWorkerTrees } = require('./config/build/workers');
const concat = require('broccoli-concat');
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

    ...addonConfig,
    ...serviceWorkerConfig(env),
    ...buildbabelConfig(env),
    ...postcssConfig,
  });

  let additionalTrees = [

    ...buildStaticTrees(env), ...buildWorkerTrees(env)
  ];

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

  // let styleFunnel = new Funnel(process.cwd() + '/app', {
  //   srcDir: 'components/**/*.css',
  //   exclude: ['styles/**/*'],
  //   include: ['**/*.css'],
  //   allowEmpty: true,
  //   annotation: 'Funnel (emberclear css-concat grab files)',
  // });

  let tree = concat('app', {
    outputFile: 'styles/component-styles.css',
    inputFiles: [
      '**/*.css'
    ],
  });
  // var StyleManifest = require('broccoli-style-manifest');
  // let componentStyles = new StyleManifest(styleFunnel, {
  //   outputFileNameWithoutExtension: 'pod-styles',
  //   annotation: 'StyleManifest (ember-component-css combining all style files that there are extensions for)'
  // });

  return mergeTrees([tree, app.toTree(), ...additionalTrees]);
};
