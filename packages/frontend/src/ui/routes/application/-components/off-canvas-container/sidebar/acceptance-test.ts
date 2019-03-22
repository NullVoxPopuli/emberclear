import { module, test } from 'qunit';
import StoreService from 'ember-data/store';

import { visit, currentURL, settled, waitFor } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';

import {
  clearLocalStorage,
  setupRelayConnectionMocks,
  setupCurrentUser,
  getService,
  text,
  createIdentity,
  waitUntilTruthy,
} from 'emberclear/tests/helpers';

import IdentityService from 'emberclear/src/services/identity/service';
import { sidebar, page } from 'emberclear/tests/helpers/pages/sidebar';
import { settings } from 'emberclear/tests/helpers/pages/settings';

module('Acceptance | Sidebar', function(hooks) {
  setupApplicationTest(hooks);
  clearLocalStorage(hooks);
  setupRelayConnectionMocks(hooks);
  setupCurrentUser(hooks);

  hooks.beforeEach(async function() {
    await visit('/chat');
    await sidebar.toggle();
    await waitUntilTruthy(() => sidebar.isOpen());
  });

  module('Contacts', function() {
    module('the add contact button is clicked', function(hooks) {
      hooks.beforeEach(async function() {
        await sidebar.contacts.clickAdd();
      });

      test('a navigation occurred', function(assert) {
        assert.equal(currentURL(), '/add-friend');
      });
    });

    module('the actual list of contacts', function() {
      module('there are 0 contacts', function() {
        test('only the current user is shown', function(assert) {
          const name = getService<IdentityService>('identity')!.name!;
          const content = text(sidebar.contacts.rows()).trim();

          assert.equal(content, name);
        });

        test('offline count does not show', function(assert) {
          assert.notOk(sidebar.contacts.offlineCount());
        });
      });

      module('there is 1 contact', function(hooks) {
        hooks.beforeEach(async function() {
          await createIdentity('first contact');
          await waitFor(sidebar.selectors.contacts);
        });

        test('there are 2 rows of names', function(assert) {
          assert.equal(sidebar.contacts.rows().length, 2);
        });

        test('offline count does not show', function(assert) {
          assert.notOk(page.contacts.offlineCount.isVisible, 'offline count is shown');
        });

        module('offline contacts are to be hidden', function(hooks) {
          hooks.beforeEach(async function() {
            await visit('/settings/interface');
            await settings.toggleHideOfflineContacts();
            await waitFor(sidebar.selectors.offlineCount);
          });

          test('only the current user is shown', function(assert) {
            const name = getService<IdentityService>('identity')!.name!;
            const content = text(sidebar.contacts.rows());

            assert.ok(content.includes(name), 'current user name is present');
            assert.equal(sidebar.contacts.rows().length, 1, 'one user in the contacts list');
          });

          test('offline count is shown', function(assert) {
            const result = sidebar.contacts.offlineCount()!.textContent;

            assert.ok(result!.match(/1/));
          });
        });
      });

      module('there are 2 contacts', function(hooks) {
        hooks.beforeEach(async function() {
          await createIdentity('first contact');
          await createIdentity('second contact');
          await waitFor(sidebar.selectors.contacts);
        });

        test('there are 3 rows of names', function(assert) {
          assert.equal(sidebar.contacts.rows().length, 3, 'there are 3 contacts');
        });

        module('offline contacts are to be hidden', function(hooks) {
          hooks.beforeEach(async function() {
            await visit('/settings/interface');
            await settings.toggleHideOfflineContacts();
            await waitFor(sidebar.selectors.offlineCount);
          });

          test('only the current user is shown', function(assert) {
            const name = getService<IdentityService>('identity')!.name!;
            const content = text(sidebar.contacts.rows());

            assert.ok(content.includes(name), 'current user name is present');
            assert.equal(sidebar.contacts.rows().length, 1, 'one user in the contacts list');
          });

          test('offline count is shown', function(assert) {
            const result = sidebar.contacts.offlineCount()!.textContent;

            assert.ok(result!.match(/2/));
          });
        });
      });

      module('there are enough contacts to scroll', function(hooks) {
        hooks.before(async function() {
          // TODO: these need implementing
          // Need a way to set the window size
        });
      });
    });
  });

  module('Channels', function(hooks) {
    test('the channel form is not visible', function(assert) {
      const form = sidebar.channels.form();

      assert.notOk(form);
    });

    test('there are 0 channels', async function(assert) {
      const store = getService<DS.Store>('store');
      const known = await store.findAll('channel');

      assert.equal(known.length, 0);
    });

    module('the add channel button is clicked', function(hooks) {
      hooks.beforeEach(async function() {
        await sidebar.channels.toggleForm();
      });

      test('the channel form is now visible', function(assert) {
        const form = sidebar.channels.form();

        assert.ok(form);
      });

      module('the cancel button is clicked', function(hooks) {
        hooks.beforeEach(async function() {
          await sidebar.channels.toggleForm();
          await settled();
        });

        test('the channel form is not visible', function(assert) {
          const form = sidebar.channels.form();

          assert.notOk(form);
        });
      });

      module('the channel form is submitted', function(hooks) {
        hooks.beforeEach(async function() {
          await sidebar.channels.fillInput('Vertical Flat Plates');
          await sidebar.channels.submitForm();
          await settled();
        });

        test('the form becomes hidden', function(assert) {
          const form = sidebar.channels.form();

          assert.notOk(form);
        });

        test('a channel is created', function(assert) {
          const store = getService<StoreService>('store');
          const known = store.peekAll('channel');

          assert.equal(known.length, 1);
          assert.equal(known.firstObject.name, 'Vertical Flat Plates');
        });
      });
    });
  });
});
