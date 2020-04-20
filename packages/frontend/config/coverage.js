module.exports = {
  useBabelInstrumenter: true,
  excludes: [
    '*/concat-stats-for/**/*',
    '*/public/**/*',
    '*/translations/**/*',
    '*/vendor/**/*',
    '**/*-test*',
    '*/app/services/messages/command-handler.ts',
  ],
  parallel: false,
};
