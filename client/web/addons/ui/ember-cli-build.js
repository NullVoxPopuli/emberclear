'use strict';

const path = require('path');

// eslint-disable-next-line node/no-unpublished-require
const EmberAddon = require('ember-cli/lib/broccoli/ember-addon');

const shoelace = path.dirname(require.resolve('@shoelace-style/shoelace'));

module.exports = function (defaults) {
  let app = new EmberAddon(defaults, {
    'ember-cli-babel': {
      enableTypeScriptTransform: true,
    },
    autoImport: {
      alias: {
        '@shoelace-style/shoelace': `@shoelace-style/shoelace/dist/custom-elements/index.js`,
      },
    },
  });

  /*
    This build file specifies the options for the dummy test app of this
    addon, located in `/tests/dummy`
    This build file does *not* influence how the addon or the app using it
    behave. You most likely want to be modifying `./index.js` or app's build file
  */

  // app.import(`${shoelace}/shoelace/shoelace.esm.js`);
  // app.import(`${shoelace}/shoelace/shoelace.css`);

  return app.toTree();
};
