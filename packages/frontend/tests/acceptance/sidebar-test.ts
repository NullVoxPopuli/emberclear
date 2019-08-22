import { module, test } from 'qunit';
import StoreService from 'ember-data/store';

import { visit, currentURL, settled, waitFor } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';

import {
  clearLocalStorage,
  setupRelayConnectionMocks,
  setupCurrentUser,
  getService,
  getStore,
} from 'emberclear/tests/helpers';

import CurrentUserService from 'emberclear/services/current-user';
import {
  page,
  selectors,
} from 'emberclear/pods/components/pod/application/off-canvas-container/-page';

import { page as settings } from 'emberclear/tests/helpers/pages/settings';
import { createContact } from 'emberclear/tests/helpers/factories/contact-factory';

module('Acceptance | Sidebar', function(hooks) {
  setupApplicationTest(hooks);
  clearLocalStorage(hooks);
  setupRelayConnectionMocks(hooks);
  setupCurrentUser(hooks);

  hooks.beforeEach(async function() {
    await visit('/chat');
    await page.toggle();
  });

  module('Contacts', function() {
    module('the add contact button is clicked', function(hooks) {
      hooks.beforeEach(async function() {
        await page.sidebar.contacts.header.clickAdd();
      });

      test('a navigation occurred', function(assert) {
        assert.equal(currentURL(), '/add-friend');
      });
    });

    module('the actual list of contacts', function() {
      module('there are 0 contacts', function() {
        test('only the current user is shown', async function(assert) {
          const name = getService<CurrentUserService>('currentUser')!.name!;
          const content = page.sidebar.contacts.list.map((c: any) => c.text).join();

          assert.equal(content, name);
        });

        test('offline count does not show', function(assert) {
          assert.notOk(page.sidebar.contacts.offlineCount.isVisible);
        });
      });

      module('there is 1 contact', function(hooks) {
        hooks.beforeEach(async function() {
          await createContact('first contact');
        });

        test('there are 2 rows of names', function(assert) {
          assert.equal(page.sidebar.contacts.list.length, 2);
        });

        test('offline count does not show', function(assert) {
          assert.notOk(page.sidebar.contacts.offlineCount.isVisible, 'offline count is shown');
        });

        module('offline contacts are to be hidden', function(hooks) {
          hooks.beforeEach(async function() {
            await visit('/settings/interface');
            await settings.ui.toggleHideOfflineContacts();
            await waitFor(selectors.offlineCount);
          });

          test('only the current user is shown', function(assert) {
            const name = getService<CurrentUserService>('currentUser')!.name!;
            const content = page.sidebar.contacts.listText;

            assert.ok(content.includes(name), 'current user name is present');
            assert.equal(page.sidebar.contacts.list.length, 1, 'one user in the contacts list');
          });

          test('offline count is shown', function(assert) {
            const result = page.sidebar.contacts.offlineCount.text;

            assert.ok(result!.match(/1/));
          });
        });
      });

      module('there are 2 contacts', function(hooks) {
        hooks.beforeEach(async function() {
          await createContact('first contact');
          await createContact('second contact');
        });

        test('there are 3 rows of names', function(assert) {
          assert.equal(page.sidebar.contacts.list.length, 3, 'there are 3 contacts');
        });

        module('offline contacts are to be hidden', function(hooks) {
          hooks.beforeEach(async function() {
            await visit('/settings/interface');
            await settings.ui.toggleHideOfflineContacts();
            await waitFor(selectors.offlineCount);
          });

          test('only the current user is shown', function(assert) {
            const name = getService<CurrentUserService>('currentUser')!.name!;
            const content = page.sidebar.contacts.listText;

            assert.ok(content.includes(name), 'current user name is present');
            assert.equal(page.sidebar.contacts.list.length, 1, 'one user in the contacts list');
          });

          test('offline count is shown', function(assert) {
            const result = page.sidebar.contacts.offlineCount.text;

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

  module('Channels', function() {
    test('the channel form is not visible', function(assert) {
      const form = page.sidebar.channels.form.isVisible;

      assert.notOk(form);
    });

    test('there are 0 channels', async function(assert) {
      const store = getStore();
      const known = await store.findAll('channel');

      assert.equal(known.length, 0);
    });

    module('the add channel button is clicked', function(hooks) {
      hooks.beforeEach(async function() {
        await page.sidebar.channels.toggleForm();
      });

      test('the channel form is now visible', function(assert) {
        const form = page.sidebar.channels.form.isVisible;

        assert.ok(form);
      });

      module('the cancel button is clicked', function(hooks) {
        hooks.beforeEach(async function() {
          await page.sidebar.channels.toggleForm();
          await settled();
        });

        test('the channel form is not visible', function(assert) {
          const form = page.sidebar.channels.form.isVisible;

          assert.notOk(form);
        });
      });

      module('the channel form is submitted', function(hooks) {
        hooks.beforeEach(async function() {
          await page.sidebar.channels.form.fill('Vertical Flat Plates');
          await page.sidebar.channels.form.submit();
          await settled();
        });

        test('the form becomes hidden', function(assert) {
          const form = page.sidebar.channels.form.isVisible;

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
