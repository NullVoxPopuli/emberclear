module.exports = {
  postcssConfig: {
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
            module: require('postcss-import'),
            options: {
              path: [
                'node_modules/shoelace-css/source/css',
                'app/styles/component-styles'
              ],
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
        ],
      },
      filter: {
        enabled: true,
        include: ['styles/*.css', 'components/**/*.css'],
        plugins: [
          {
            module: require('autoprefixer'),
            options: {
              browsers: ['last 2 versions'], // this will override the config, but just for this plugin
            },
          },
        ],
      },
    },
  },
};
