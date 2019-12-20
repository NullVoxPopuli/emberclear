module.exports = {
  buildBabelConfig({ isProduction }) {
    return {
      // was for enabling dynamic import.
      babel: {
        plugins: [require.resolve('ember-auto-import/babel-plugin')],
      },

      'ember-cli-babel': {
        includePolyfill: false,
        disablePresetEnv: true,
        disableDebugTooling: isProduction,
        includeExternalHelpers: true,
        // Will not build if uncommented:
        // disableEmberModulesAPIPolyfill: true
        // compileModules: false,
      },
    };
  },
};
