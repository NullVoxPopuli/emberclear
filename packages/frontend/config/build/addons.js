'use strict';

const simpleAddonConfigs = {
  'ember-test-selectors': {
    strip: false, // isProduction,
  },
};

function serviceWorkerConfig({ version }) {
  return {
    'asset-cache': {
      version,
      include: ['assets/**/*', '**/*.html', 'index.html'],
      exclude: ['.well-known/**/*', 'bundle.html', 'favicon.ico', 'robots.txt'],
    },
    'esw-index': {
      version,
      excludeScope: [/\.well-known/, /bundle.html/, /favicon.ico/, /robots.txt/],
    },
    'esw-cache-fallback': {
      patterns: ['https://(.+)/open_graph?(.+)'],
    },
  };
}

function addonConfig(env) {
  return {
    ...simpleAddonConfigs,
    ...serviceWorkerConfig(env),
  };
}

module.exports = {
  addonConfig,
};
