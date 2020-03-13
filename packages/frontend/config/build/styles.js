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
          require('stylelint'),
          PostCSSImport({
            path: ['node_modules/shoelace-css/source/css'],
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
              overflowWrap: false,
              colorRgba: false,
              psuedoClassAnyLink: false,
              psuedoClassNot: false,
              psuedoClassMatches: false,
              psuedoElements: false,
              initial: false,
              // filter: false,
              fontVariant: false,
              // fontFamilySystemUi: false,
              colorHexAlpha: false,
              colorGray: false,
              colorRgb: false,
              colorHsl: false,
              colorHwb: false,
              colorRebeccapurple: false,
              // attributeCaseInsensitive: false,
              // customSelectors: false,
              // mediaQueriesRange: false,
              // customMedia: false,
              // nesting: false,
              imageSet: false,
              // calc: false,
              // applyRule: false,
            },
          }),
        ],
      },
      filter: {
        enabled: true,
        plugins: [
          autoprefixer({
            browsers: ['last 2 versions'], // this will override the config, but just for this plugin
          }),
        ],
      },
    },
  },
};
