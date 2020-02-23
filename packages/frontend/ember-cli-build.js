'use strict';

const mergeTrees = require('broccoli-merge-trees');
const EmberApp = require('ember-cli/lib/broccoli/ember-app');
const gitRev = require('git-rev-sync');
const UnwatchedDir = require('broccoli-source').UnwatchedDir;

const { addonConfig } = require('./config/build/addons');
const { buildBabelConfig } = require('./config/build/babel');
const { buildStaticTrees } = require('./config/build/static');
const { postcssConfig } = require('./config/build/styles');
const { buildWorkerTrees } = require('./config/build/workers');
const crypto = require('crypto');

const { EMBROIDER } = process.env;

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
    minifyCSS: { enabled: isProduction },

    sourcemaps: {
      enabled: true, // !isProduction,
      extensions: 'js',
    },
    fingerprint: {
      // why customHash?
      // so we can reference the hash from an global variable
      // (used in build/static.js), which allows us to reference
      // the fingerprint from runtime code.
      //
      // It'd be great if there was a built-in API to do this by default,
      // but I think each static asset gets its own fingerprint
      // which means we'd need a lookup table for asset to hash.
      //
      // Using the same hash for everything simplifies a lot.
      // However, it does mean that we bust cache more often.
      //
      // The hash is available as an IIFE at /assets/assets-fingerprint.js
      // built by buildStaticTrees(...)
      customHash: hash,
    },

    emberData: {
      compatWith: '3.16.0',
    },

    // Why are configs split up this way?
    // To reduce mental load when parsing the build configuration.
    // We don't need to view everything all at once.
    ...addonConfig(env),
    ...buildBabelConfig(env),
    ...postcssConfig,
  });

  // Additional paths to copy to the public directory in the final build.
  let additionalTrees = [...buildStaticTrees(env), ...buildWorkerTrees(env)];

  if (!isProduction) {
    app.trees.public = new UnwatchedDir('public');
  }

  if (EMBROIDER) {
    console.info('\n--------------------------');
    console.info('\nE M B R O I D E R\n');
    console.info('--------------------------\n');

    const { compatBuild } = require('@embroider/compat');
    const { Webpack } = require('@embroider/webpack');

    return compatBuild(app, Webpack, {
      extraPublicTrees: additionalTrees,
      // staticAddonTestSupportTrees: true,
      // staticAddonTrees: true,
      // staticHelpers: true,
      // staticComponents: true,
      // splitAtRoutes: true,
      // skipBabel: [],
    });
  }

  // Old-style broccoli-build
  return mergeTrees([app.toTree(), ...additionalTrees]);
};
