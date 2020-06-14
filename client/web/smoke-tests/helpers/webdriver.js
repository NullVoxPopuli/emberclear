'use strict';

const { setupEndpoint } = require('../helpers/setup-endpoint');
const { setUpWebDriver } = require('@faltest/lifecycle');

function setupTest() {
  setupEndpoint(this);
  setUpWebDriver(this);
}

module.exports = { setupTest };
