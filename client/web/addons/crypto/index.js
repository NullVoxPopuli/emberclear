'use strict';

const path = require('path');
const os = require('os');
const fs = require('fs');

const Funnel = require('broccoli-funnel');

const { buildWorkers } = require('./lib/worker-build');

module.exports = {
  name: require('./package').name,

  options: {
    'ember-cli-babel': {
      enableTypeScriptTransform: true,
    },
  },

  // override
  isDevelopingAddon() {
    return true;
  },

  // override
  treeForPublic() {
    let buildDir = fs.mkdtempSync(path.join(os.tmpdir(), '@emberclear--crypto--'));

    let options = {
      isProduction: true,
      buildDir,
    };

    // outputs {buildDir}/crypto.js
    buildWorkers(options);

    return new Funnel(buildDir, {
      destDir: 'workers/',
    });
  },
};
