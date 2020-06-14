'use strict';

const BasePageObject = require('./-base');

class Login extends BasePageObject {
  get beginButton() {
    return this._create('[href="/chat"]');
  }

  get logInInsteadButton() {
    //element not interactable
    return {
      click: async () => {
        await this._browser.execute(() => {
          document.querySelector('[href="/login"]').click();
        });
      },
    };
    // return this._create('[href="/login"]');
  }

  get name() {
    return this._createMany('input').first;
  }

  get mnemonic() {
    // need a `.pageObjectAt(1)` or similar
    return this._create(async () => {
      return (await this._browser.$$('input'))[1];
    });
  }

  get logInButton() {
    return this._createMany('button').last;
  }

  async logIn(user) {
    await this.beginButton.click();

    await this.logInInsteadButton.click();

    await this.name.setValue(user.name);
    await this.mnemonic.setValue(user.mnemonic);

    await this.logInButton.click();
  }
}

module.exports = Login;
