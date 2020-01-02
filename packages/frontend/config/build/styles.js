const PostCSSImport = require('postcss-import');
const PostCSSNext = require('postcss-cssnext');
const autoprefixer = require('autoprefixer');

module.exports = {
  postcssConfig: {
    // NOTE:
    //   css-modules is not worth the invasiveness
    //   by default, it uniqueifys classes found in templates
    //   this is not good for integrating with 3rd party css
    // config for https://github.com/salsify/ember-css-modules/
    //
    // NOTE:
    //   css-modules, while using correct plugin invocation
    //   and configuration, is not easy to configure correctly
    //   for use with shoelace / the existing postcss :-\
    __cssModules: {
      // config for https://github.com/salsify/broccoli-css-modules#plugins
      plugins: {
        after: [
          PostCSSImport({
            path: ['node_modules/shoelace-css/source/css', 'app/styles'],
          }),
        ],
        postprocess: [
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
    },

    // config for https://github.com/jeffjewiss/ember-cli-postcss
    //
    // NOTE: for https://github.com/ebryn/ember-component-css
    // component scoping is not used.
    // ember-component-css is _only_ used for concating
    // component-css
    postcssOptions: {
      compile: {
        enabled: true,
        extension: 'css',
        plugins: [
          {
            module: PostCSSImport,
            options: {
              path: ['node_modules/shoelace-css/source/css'],
            },
          },
          {
            module: PostCSSNext,
            options: {
              features: {
                colorFunction: {
                  preserveCustomProps: false,
                },
                customProperties: {
                  preserve: true,
                },
                rem: false,
              },
            },
          },
        ],
      },
      filter: {
        enabled: true,
        plugins: [
          {
            module: autoprefixer,
            options: {
              browsers: ['last 2 versions'], // this will override the config, but just for this plugin
            },
          },
        ],
      },
    },
  },
};
