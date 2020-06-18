'use strict';

const BasePageObject = require('./-base');

class Setup extends BasePageObject {
  get nameInput() {
    return this._create('[data-test-name-form] [data-test-name-field]');
  }

  get nextButton() {
    return this._create('[data-test-focus-card] [data-test-next]');
  }

  async onboardSelf(name) {
    await this.nameInput.waitForInsert();
    await this.nameInput.setValue(name);

    await this.nextButton.waitForInsert();
    await this.nextButton.click();

    await this.nextButton.waitForInsert();
    await this.nextButton.click();
  }
}

module.exports = Setup;
