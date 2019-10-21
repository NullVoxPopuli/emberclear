'use strict';

const BasePageObject = require('./-base');

class Sidebar extends BasePageObject {
  async open() {
    if (await this.isOpen()) return;

    await this.toggle();
  }

  async close() {
    if (!(await this.isOpen())) return;

    await this.toggle();
  }

  async toggle() {
    await this.toggleButton.click();
  }
  async isOpen() {
    let style = await this.main.getAttribute('style');

    return style.includes('300');
  }

  get main() {
    return this._create('main');
  }

  get toggleButton() {
    return this._create('[data-test-hamburger-toggle');
  }

  get contacts() {
    return this._createMany(
      '[data-test-contact-row]',
      (/* { each, create } */) => {
        return {};
      }
    );
  }
}

module.exports = Sidebar;
