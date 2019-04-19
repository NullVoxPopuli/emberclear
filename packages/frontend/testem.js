const FailureOnlyReporter = require('testem-failure-only-reporter');

const CI_BROWSER = process.env.CI_BROWSER || 'Chrome';

module.exports = {
  test_page: 'tests/index.html?hidepassed',
  disable_watching: true,
  reporter: FailureOnlyReporter,

  launch_in_ci: [CI_BROWSER],
  launch_in_dev: ['Chrome'],
  browser_args: {
    Chrome: {
      mode: 'ci',
      args: [
        // --no-sandbox is needed when running Chrome inside a container
        process.env.TRAVIS || process.env.CI ? '--no-sandbox' : null,

        '--disable-gpu',
        '--headless',
        '--remote-debugging-port=0',
        '--window-size=1440,900',
      ].filter(Boolean),
    },
    Firefox: {
      mode: 'ci',
      args: ['-headless'],
    },
  },
};
