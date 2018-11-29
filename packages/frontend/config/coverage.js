module.exports = {
  useBabelInstrumenter: true,
  excludes: [
    '*/fastboot/**/*',
    '*/concat-stats-for/**/*',
    '*/public/**/*',
    '*/translations/**/*',
    '*/vendor/**/*',
    '**/*-test*',
  ],
  parallel: true,
};
