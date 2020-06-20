module.exports = {
  buildBabelConfig({ CONCAT_STATS }) {
    return {
      babel: {
        ...(CONCAT_STATS ? { sourceMaps: 'inline' } : {}),
      },
    };
  },
};
