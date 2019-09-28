'use strict';

const { setUpWebDriver } = require('@faltest/lifecycle');
const execa = require('execa');
const assert = require('assert');

describe('smoke', function() {
  setUpWebDriver.call(this);

  before(async function() {
    this.server = execa('http-server', ['dist'], {
      preferLocal: true,
    });

    this.port = await new Promise(resolve => {
      this.server.stdout.on('data', data => {
        let str = data.toString();
        let matches = str.match(/http:\/\/127\.0\.0\.1:(\d+)$/m);
        if (matches) {
          let port = parseInt(matches[1], 10);

          resolve(port);
        }
      });
    });
  });

  beforeEach(async function() {
    await this.browser.url(`http://localhost:${this.port}`);
  });

  after(async function() {
    await this.server.kill();

    await this.server;
  });

  it('works', async function() {
    let title = await this.browser.getTitle();

    assert.strictEqual(title, 'emberclear');
  });
});
