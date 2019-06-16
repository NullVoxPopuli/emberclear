module.exports = {
  useBabelInstrumenter: true,
  excludes: [
    '*/concat-stats-for/**/*',
    '*/public/**/*',
    '*/translations/**/*',
    '*/vendor/**/*',
    '**/*-test*',
  ],
  parallel: true,
};
