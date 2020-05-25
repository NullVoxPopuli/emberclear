'use strict';

const path = require('path');

const PostCSSImport = require('postcss-import');
const PostCSSNext = require('postcss-cssnext');

const shoelacePath = path.join(__dirname, '..', '..', '..', 'node_modules', 'shoelace-css', 'source', 'css');

module.exports = {
  name: require('./package').name,

  isDevelopingAddon() {
    return true;
  },

  included(app) {
    this._super.included.apply(this, arguments);

    app.options = app.options || {};

    app.options.postcssOptions = {
      compile: {
        enabled: true,
        extension: 'css',
        plugins: [
          PostCSSImport({
            path: [shoelacePath],
          }),
          PostCSSNext({
            features: {
              colorFunction: {
                preserveCustomProps: false,
              },
              customProperties: {
                preserve: true,
              },
              rem: false,
            },
          }),
        ],
      },
    }
  }

};

