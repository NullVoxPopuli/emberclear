'use strict';

module.exports = {
  name: require('./package').name,

  // override
  isDevelopingAddon() {
    return true;
  },

  options: {
    'ember-cli-babel': {
      enableTypeScriptTransform: true,
    },
  },
};
