module.exports = {
  buildBabelConfig({ CONCAT_STATS }) {
    return {
      // was for enabling dynamic import.
      babel: {
        plugins: [require.resolve('ember-auto-import/babel-plugin')],
        ...(CONCAT_STATS ? { sourceMaps: 'inline' } : {}),
      },
    };
  },
};
