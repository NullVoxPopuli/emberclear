'use strict';

const BasePageObject = require('./-base');

class Chat extends BasePageObject {
  get input() {
    return this._create('textarea');
  }

  get sendButton() {
    // TODO: this will be changed to a button soon, instead of an input
    return this._create('[data-test-chat-submit]');
  }

  get messages() {
    return this._createMany('.message', ({ each }) => {
      each(({ pageObject }) => ({
        name: pageObject.scopeChild('.message-header .from'),
        text: pageObject.scopeChild('.message-body'),
      }));
    });
  }

  async sendMessage(message) {
    await this.input.setValue(message);

    // This is only necessary for CI, but not sure why.
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // element is not interactable
    await this._browser.execute(() => {
      document.querySelector('[data-test-chat-submit]').click();
    });
  }

  async waitForResponse(user) {
    await this._browser.waitUntil(async () => {
      let messages = await this.messages.getPageObjects();

      for (let message of messages) {
        let name = await message.name.getText();
        let text = await message.text.getText();

        if (name === user.name && text === user.message) {
          return true;
        }
      }
    }, parseInt(process.env.WEBDRIVER_TIMEOUTS_OVERRIDE));
  }
}

module.exports = Chat;
