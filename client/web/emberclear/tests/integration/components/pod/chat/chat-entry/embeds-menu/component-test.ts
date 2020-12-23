import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';

import { setupRelayConnectionMocks } from 'emberclear/tests/helpers';
import { page } from 'emberclear/tests/helpers/pages/chat';

import { createContact, setupCurrentUser } from '@emberclear/local-account/test-support';

import type { TestContext } from 'ember-test-helpers';
import type { Contact } from '@emberclear/local-account';

module('Integration | Component | embeds-menu', function (hooks) {
  setupRenderingTest(hooks);
  setupRelayConnectionMocks(hooks);
  setupCurrentUser(hooks);

  let to!: Contact;

  hooks.beforeEach(async function (this: TestContext) {
    to = await createContact('Test Recipient');

    this.setProperties({ to });

    await render(hbs`
      <Pod::Chat::ChatEntry::EmbedsMenu @sendTo={{this.to}} />
    `);
  });

  module('the menu is opened', function (hooks) {
    hooks.beforeEach(async function (assert) {
      await page.chatOptions.toggle();

      assert.ok(page.chatOptions.isOpen, 'menu is open');
    });

    test('can be closed', async function (assert) {
      await page.chatOptions.toggle();

      assert.notOk(page.chatOptions.isOpen, 'is closed');
    });

    module('the embeds modal is opened', function (hooks) {
      hooks.beforeEach(async function (assert) {
        await page.chatOptions.toggleEmbedModal();

        assert.ok(page.embedModal.modalContent.isVisible, 'modal is visible');
      });

      test('can be cancelled', async function (assert) {
        await page.embedModal.backdrop.click();

        assert.notOk(page.embedModal.isVisible, 'modal is hidden');
      });

      test('the title includes the recipient name', function (assert) {
        assert.contains(page.embedModal.title.toString(), to.name);
      });

      module('some code is submitted', function (hooks) {
        hooks.beforeEach(async function () {
          await page.embedModal.fillInTitle('Some TypeScript');
          await page.embedModal.fillInCode(`let two = 2;`);
          await page.embedModal.selectLanguage('TypeScript');
          await page.embedModal.submit();
        });

        test('the modal hides', function (assert) {
          assert.notOk(page.embedModal.isVisible, 'modal is hidden');
        });
      });
    });
  });
});
