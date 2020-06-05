'use strict';

const path = require('path');
const Funnel = require('broccoli-funnel');
const writeFile = require('broccoli-file-creator');

const prismPath = path.join(__dirname, '..', '..', '..', 'node_modules', 'prismjs');

module.exports = {
  buildStaticTrees({ isProduction, hash }) {
    let prism = new Funnel(prismPath, {
      include: ['prism.js', 'themes/*', 'plugins/**', 'components/**'],
      destDir: '/prismjs/',
    });

    // source: https://codeburst.io/ember-js-lazy-assets-fingerprinting-loading-static-dynamic-assets-on-demand-f09cd7568155
    // ------------------------------------------------------------------------------------------
    // Create a asset-fingerprint.js file which holds the fingerprintHash value
    // This hash value is used by all the asset loaders to load the assets on-demand
    // ------------------------------------------------------------------------------------------
    let assetFingerprintTree = writeFile(
      './assets/assets-fingerprint.js',
      `(function(_window){ _window.ASSET_FINGERPRINT_HASH = "${
        isProduction ? `-${hash}` : ''
      }"; })(window);`
    );

    return [prism, assetFingerprintTree];
  },
};
