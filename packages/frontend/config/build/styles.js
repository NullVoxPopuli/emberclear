const autoprefixer = require('autoprefixer');
const CssImport = require('postcss-import');

module.exports = {
  postcssConfig: {
    postcssOptions: {
      compile: {
        enabled: true,
        extension: 'css',
        plugins: [
          {
            module: CssImport,
            options: {
              path: ['node_modules/shoelace-css/source/css', 'app/styles/component-styles'],
            },
          },
          {
            module: require('postcss-cssnext'),
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
          // {
          //   module: require('postcss-preset-env'),
          //   options: {
          //     stage: 0,
          //     // browsers: 'last 2 versions',
          //     // preserve: false,
          //     features: {
          //       // abandoned
          //       'color-function': {
          //         preserveCustomProps: true,
          //       },
          //       // stage 0
          //       // 'nesting-rules': true,
          //       // stage 1
          //       // 'custom-media-queries': true,
          //       // stage 2
          //       'color-mod-function': {
          //         preserveCustomProps: true,
          //       }, // color()
          //       // 'color-functional-notation': false,
          //       // stage 4
          //       // stage 3
          //       'custom-properties': {
          //         preserve: true,
          //       },
          //     },
          //   },
          // },
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
