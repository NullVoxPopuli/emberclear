'use strict';

const { BasePageObject } = require('@faltest/page-objects');

class BasePage extends BasePageObject {
  constructor(host, ...args) {
    super(...args);

    this.host = host;
  }

  async navigateTo(path = '') {
    let target = `${this.host}/${path}`;

    if (!this._browser.getUrl()) {
      await this._browser.url(target);
    }

    await this._browser.waitUntil(async () => {
      return this._create('[data-test-locale-toggle]');
    });
  }
}

module.exports = BasePage;
