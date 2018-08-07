'use strict';

// prettier-ignore
const browsers = [
  'last 1 Chrome versions',
  'last 1 Firefox versions',
  'last 1 Safari versions',
  'ie 11'
];

const isCI = !!process.env.CI;
const isProduction = process.env.EMBER_ENV === 'production';

module.exports = {
  browsers,
};
