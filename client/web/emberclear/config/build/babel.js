module.exports = {
  buildBabelConfig({ CONCAT_STATS }) {
    return {
      'ember-cli-babel': {
        enableTypeScriptTransform: true,
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
        // was for enabling dynamic import.
        plugins: [require.resolve('ember-auto-import/babel-plugin')],
        ...(CONCAT_STATS ? { sourceMaps: 'inline' } : {}),
      },
    };
  },
};
