module.exports = {
  buildBabelConfig({ CONCAT_STATS }) {
    return {
      'ember-cli-babel': {
        // Requires another bundler?
        // compileModules: false,
        //
        // No distinguishable difference
        // disableDebugTooling: true,
        //
        // requires ec-typescript@v4
        enableTypeScriptTransform: true,

        // regenerator runtime + core-js
        // no difference with current browserlist
        // includePolyfill: false,
        //
        // ember-cli-babel already analyzes and does some dynamic stuff with this
        // includeExternalHelpers: false,
        //
        // Not all build bits are parallelizable :(
        // throwUnlessParallelizable: true,
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
