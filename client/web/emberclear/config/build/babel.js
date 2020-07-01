module.exports = {
  buildBabelConfig({ CONCAT_STATS }) {
    return {
      'ember-cli-babel': {
        compileModules: true,
        //   enableTypeScriptTransform: true,
        //   // throwUnlessParallelizable: true,
      },
      babel: {
        // presets: [
        //   [
        //     '@babel/preset-typescript',
        //     {
        //       allowDeclareFields: true,
        //     },
        //   ],
        // ],
        plugins: [
          // [
          //   require.resolve('@babel/plugin-transform-typescript'),
          //   {
          //     allowDeclareFields: true,
          //   },
          // ],

          // for enabling dynamic import.
          require.resolve('ember-auto-import/babel-plugin'),
        ],
        ...(CONCAT_STATS ? { sourceMaps: 'inline' } : {}),
      },
    };
  },
};
