'use strict';

const crypto = require('crypto');
const gitRev = require('git-rev-sync');

const mergeTrees = require('broccoli-merge-trees');
const EmberApp = require('ember-cli/lib/broccoli/ember-app');
const { UnwatchedDir } = require('broccoli-source');

const { logWithAttention } = require('@emberclear/config/utils/log');
const {
  applyEnvironmentVariables,
  configureBabel,
} = require('@emberclear/config/utils/ember-build');

const { addonConfig } = require('./config/build/addons');
const { buildStaticTrees } = require('./config/build/static');

const { EMBROIDER, CONCAT_STATS } = process.env;

const version = gitRev.short();
const hash = crypto.createHash('md5').update(new Date().getTime().toString()).digest('hex');

module.exports = function (defaults) {
  let environment = EmberApp.env();
  let isProduction = environment === 'production';

  let env = {
    isProduction,
    isTest: environment === 'test',
    environment,
    version,
    hash,
    CONCAT_STATS,
  };

  let appOptions = {
    hinting: false,
    sourcemaps: {
      enabled: false,
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
  };

  configureBabel(appOptions);
  applyEnvironmentVariables(appOptions);

  if (isProduction) {
    appOptions.autoImport = appOptions.autoImport || {};
    appOptions.autoImport.exclude = ['tweetnacl'];
  }

  logWithAttention(env, appOptions);

  let app = new EmberApp(defaults, appOptions);

  // Additional paths to copy to the public directory in the final build.
  let additionalTrees = [...buildStaticTrees(env)];

  if (!isProduction) {
    app.trees.public = new UnwatchedDir('public');
  }

  if (EMBROIDER) {
    logWithAttention('E M B R O I D E R');

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
