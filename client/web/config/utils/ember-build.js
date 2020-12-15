'use strict';

const path = require('path');
const yn = require('yn');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

const { CONCAT_STATS, SOURCEMAPS_DISABLED, MINIFY_DISABLED } = process.env;

function configureBabel(appConfig) {
  appConfig.babel = appConfig.babel || {};
  appConfig.babel = {
    ...(appConfig.babel || {}),
    plugins: [
      ...(appConfig.babel.plugins || []),
      // for enabling dynamic import.
      require.resolve('ember-auto-import/babel-plugin'),
    ],
  };

  appConfig['ember-cli-babel'] = {
    ...(appConfig['ember-cli-babel'] || {}),
    enableTypeScriptTransform: true,
    throwUnlessParallelizable: true,
  };
}

function applyEnvironmentVariables(appOptions) {
  if (yn(SOURCEMAPS_DISABLED)) {
    appOptions['sourcemaps'] = { enabled: false };
    appOptions.babel.sourceMaps = false;
  }

  if (yn(MINIFY_DISABLED)) {
    appOptions['ember-cli-terser'] = { enabled: false };
    appOptions.minifyCSS = { enabled: false };
  }

  if (yn(CONCAT_STATS)) {
    appOptions.autoImport = appOptions.autoImport || {};
    appOptions.autoImport.webpack = appOptions.autoImport.webpack || {};
    appOptions.autoImport.webpack.plugins = [
      new BundleAnalyzerPlugin({
        analyzerMode: 'static',
        openAnalyzer: false,
        reportFilename: path.join(process.cwd(), 'concat-stats-for', 'ember-auto-import.html'),
      }),
    ];
  }
}

module.exports = { applyEnvironmentVariables, configureBabel };
