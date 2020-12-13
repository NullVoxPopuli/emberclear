'use strict';

const mergeTrees = require('broccoli-merge-trees');
const EmberApp = require('ember-cli/lib/broccoli/ember-app');

const { logWithAttention } = require('@emberclear/config/utils/log');
const {
  applyEnvironmentVariables,
  configureBabel,
} = require('@emberclear/config/utils/ember-build');

const { EMBROIDER } = process.env;

module.exports = function (defaults) {
  let appOptions = {};

  configureBabel(appOptions);
  applyEnvironmentVariables(appOptions);

  let app = new EmberApp(defaults, appOptions);

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
  return mergeTrees([app.toTree()]);
};
