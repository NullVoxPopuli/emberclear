'use strict';

const { BasePageObject } = require('@faltest/page-objects');

class AddFriend extends BasePageObject {
  constructor(host, ...args) {
    super(...args);

    this.host = host;
  }

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

  async addFriend(user) {
    await this.addFriendButton.click();

    await this._browser.url(`${this.host}/invite?name=${user.name}&publicKey=${user.publicKey}`);
  }
}

module.exports = AddFriend;
