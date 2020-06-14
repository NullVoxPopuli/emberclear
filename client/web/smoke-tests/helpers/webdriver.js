'use strict';

const { setupEndpoint } = require('../helpers/setup-endpoint');
const { setUpWebDriver } = require('@faltest/lifecycle');

function setupTest() {
  setupEndpoint.call(this);
  setUpWebDriver.call(this);
}

module.exports = { setupTest };
