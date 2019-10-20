const MultiReporter = require('testem-multi-reporter');
const GitLabReporter = require('testem-gitlab-reporter');
const TAPReporter = require('testem/lib/reporters/tap_reporter');
const fs = require('fs');
const util = require('util')

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
  browser_start_timeout: 30,
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

        process.platform === 'win32' ? '--disable-gpu' : null,
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

let {reporter: _,  ...config } = module.exports;

console.dir(config, { depth: 4 });
