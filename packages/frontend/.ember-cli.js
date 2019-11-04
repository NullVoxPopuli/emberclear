'use strict';

const { setEdition } = require('@ember/edition-utils');

setEdition('octane');

module.exports = {
  /**
    Ember CLI sends analytics information by default. The data is completely
    anonymous, but there are times when you might want to disable this behavior.

    Setting `disableAnalytics` to true will prevent any data from being sent.
  */
  disableAnalytics: false,
  liveReload: true,
  host: '0.0.0.0',
  // no pods, use co-located components
  usePods: false,
  componentStructure: 'nested',
  // for service-worker testing
  ssl: false,
};
