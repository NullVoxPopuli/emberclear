'use strict';

const { setUpWebDriver } = require('@faltest/lifecycle');
const Server = require('ember-cli-test-server');
const assert = require('assert');

describe('smoke', function() {
  setUpWebDriver.call(this);

  before(async function() {
    this.server = new Server();

    this.port = await this.server.start();
  });

  beforeEach(async function() {
    await this.browser.url(`http://localhost:${this.port}`);
  });

  after(async function() {
    await this.server.stop();
  });

  it('works', async function() {
    let title = await this.browser.getTitle();

    assert.strictEqual(title, 'emberclear');
  });
});
