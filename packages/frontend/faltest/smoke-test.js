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

  it('works #browser1 #browser2', async function() {
    let title = await this.browser.getTitle();

    assert.strictEqual(title, 'emberclear');

    await this.browser.click('[href="/chat"]');

    let alias = Math.random()
      .toString(36)
      .substr(2);

    await this.browser.setValue('[placeholder="Your desired alias"]', alias);

    await this.browser.click('[value="Next"]');

    await this.browser.click('[href="/chat"]');

    // element click intercepted: Element <a class="button button-xs" href="/add-friend">...</a> is not clickable at point (274, 76). Other element would receive the click: <a class="service-worker-update-notify alert alert-info has-shadow" href="/chat" style="z-index: 100;">...</a>
    // await this.browser.click('[href="/add-friend"]');
    await this.browser.execute(() => {
      // eslint-disable-next-line no-undef
      document.querySelector('[href="/add-friend"]').click();
    });

    let friendLink = await this.browser.getAttribute(
      '[data-clipboard-text]',
      'data-clipboard-text'
    );

    assert.ok(friendLink.length > 0);
  });
});
