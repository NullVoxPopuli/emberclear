'use strict';

const BasePageObject = require('./-base');

class AddFriend extends BasePageObject {
  get addFriendButton() {
    // element click intercepted: Element <a class="button button-xs" href="/add-friend">...</a> is not clickable at point (274, 76). Other element would receive the click: <a class="service-worker-update-notify alert alert-info has-shadow" href="/chat" style="z-index: 100;">...</a>
    // return this._create('[href="/add-friend"]');
    return {
      click: async () => {
        await this._browser.execute(() => {
          // eslint-disable-next-line no-undef
          document.querySelector('[href="/add-friend"]').click();
        });
      },
    };
  }

  async inviteUrl() {
    let dataAttr = 'data-clipboard-text';
    let pageObject = this._create(`[${dataAttr}]`);

    await pageObject.waitForInsert();

    let text = await pageObject.getAttribute(dataAttr);

    return text;
  }

  async visit() {
    await this.navigateTo('add-friend');
  }

  async addFriend(key) {
    let publicKey = key.publicKey || key;
    let isUrl = publicKey.includes('/');

    await this.addFriendButton.click();

    let url = isUrl
      ? publicKey
      : `${this.host}/invite?name=${key.name}&publicKey=${publicKey}`;

    await this._browser.url(url);
  }
}

module.exports = AddFriend;
