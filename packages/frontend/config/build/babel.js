module.exports = {
  buildBabelConfig() {
    return {
      // was for enabling dynamic import.
      babel: {
        plugins: [require.resolve('ember-auto-import/babel-plugin')],
      },
    };
  },
};
