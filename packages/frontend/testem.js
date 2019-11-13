const MultiReporter = require('testem-multi-reporter');
const GitLabReporter = require('testem-gitlab-reporter');
const TAPReporter = require('testem/lib/reporters/tap_reporter');
const fs = require('fs');

const CI_BROWSER = process.env.CI_BROWSER || 'Chrome';

let reporter = new MultiReporter({
  reporters: [
    {
      ReporterClass: TAPReporter,
      args: [false, null, { get: () => false }],
    },
    {
      ReporterClass: GitLabReporter,
      args: [false, fs.createWriteStream('junit.xml'), { get: () => false }],
    },
  ],
});

module.exports = {
  test_page: 'tests/index.html?hidepassed',
  browser_disconnect_timeout: 120,
  disable_watching: true,
  reporter,

  launch_in_ci: [CI_BROWSER],
  launch_in_dev: ['Chrome'],
  browser_args: {
    Chrome: {
      mode: 'ci',
      args: [
        // --no-sandbox is needed when running Chrome inside a container
        process.env.TRAVIS || process.env.CI ? '--no-sandbox' : null,

        // '--disable-gpu',
        '--headless',
        '--remote-debugging-port=0',
        '--window-size=1280,720', // 720p
      ].filter(Boolean),
    },
    Firefox: {
      mode: 'ci',
      args: ['-headless'],
    },
  },
};
