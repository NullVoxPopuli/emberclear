import { module, test, skip } from 'qunit';
import { visit, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';

import {
  clearLocalStorage,
  setupCurrentUser,
  setupRelayConnectionMocks,
  getStore,
  getService,
} from 'emberclear/tests/helpers';

import { settings } from 'emberclear/tests/helpers/pages/settings';
import { app } from 'emberclear/tests/helpers/pages/app';

import IdentityService from 'emberclear/src/services/identity/service';

module('Acceptance | Settings', function(hooks) {
  setupApplicationTest(hooks);
  clearLocalStorage(hooks);
  setupRelayConnectionMocks(hooks);

  module('when not logged in', function(hooks) {
    hooks.beforeEach(async function() {
      await visit('/settings');
    });

    test('is redirected to setup', function(assert) {
      assert.equal(currentURL(), '/setup/new');
    });
  });

  module('when logged in', function(hooks) {
    setupCurrentUser(hooks);

    hooks.beforeEach(async function(assert) {
      await visit('/settings');

      assert.equal(currentURL(), '/settings');
    });

    module('Changing Name', function() {
      module('name field changes to some other text', function(hooks) {
        const newName = 'whatever, this is a test or something';

        hooks.beforeEach(async function() {
          await settings.fillNameField(newName);
          await settings.save();
        });

        test('the name has changed', function(assert) {
          const service = getService<IdentityService>('identity');
          const actual = service.name;

          assert.equal(actual, newName);
        });

        skip('confirmation is display', function(assert) {
          const text = app.toast()!.textContent!;

          assert.ok(text.includes('Identity Updated'));
        });
      });
    });

    module('Showing the private key', function() {
      test('key is not shown by default', function(assert) {
        const key = settings.privateKeyText();

        assert.notOk(key);
      });

      module('Show private key is clicked', function(hooks) {
        hooks.beforeEach(async function() {
          await settings.togglePrivateKey();
        });

        test('the private key is shown', function(assert) {
          const key = settings.privateKeyText();

          assert.ok(key);
        });
      });
    });

    module('Downloading settings', function() {
      // TODO: how to test downloads?
    });

    module('Messages exist', function(hooks) {
      hooks.beforeEach(async function(assert) {
        const store = getStore();

        await store.createRecord('message', {}).save();
        await store.createRecord('message', {}).save();

        const messages = await store.findAll('message');

        assert.equal(messages.length, 2);
      });

      module('Clicking the Delete Messages button', function(hooks) {
        hooks.beforeEach(async function() {
          await visit('/settings/danger-zone');
          await settings.deleteMessages();
        });

        test('deletes the messages', async function(assert) {
          const messages = await getStore().findAll('message');

          assert.equal(messages.length, 0);
        });
      });
    });
  });
});
