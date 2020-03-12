import { module, test } from 'qunit';

import { visit, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';

import {
  stubService,
  clearLocalStorage,
  setupCurrentUser,
  setupRelayConnectionMocks,
  assertExternal,
  getStore,
  setupWorkers,
} from 'emberclear/tests/helpers';

import { page } from 'emberclear/components/app/top-nav/user-drop-menu/-page';
import { page as logoutPage } from 'emberclear/tests/helpers/pages/logout';

module('Acceptance | Logout', function(hooks) {
  setupApplicationTest(hooks);
  setupWorkers(hooks);
  clearLocalStorage(hooks);
  setupRelayConnectionMocks(hooks);

  module('When not logged in', function(hooks) {
    hooks.beforeEach(async function() {
      stubService('currentUser', {
        isLoggedIn: false,
        load() {},
        exists: () => false,
      });

      await visit('/logout');
    });

    test('redirects to setup', function(assert) {
      assert.equal(currentURL(), '/setup/new');
      assertExternal(assert as any);
    });
  });

  module('When logged in', function(hooks) {
    setupCurrentUser(hooks);
    setupRelayConnectionMocks(hooks);

    hooks.beforeEach(async function() {
      await visit('/');
    });

    module('user dropdown is open', function(hooks) {
      hooks.beforeEach(async function() {
        await page.toggle();
      });

      module('clicking logout', function(hooks) {
        hooks.beforeEach(async function() {
          await page.logout();
        });

        test('navigates to the logout warning page', function(assert) {
          assert.equal(currentURL(), '/logout');
          assertExternal(assert as any);
        });

        module('confirm logout', function(hooks) {
          hooks.beforeEach(async function() {
            await logoutPage.confirmLogout();
          });

          test('the user is logged out', function(assert) {
            let store = getStore();

            assert.equal(currentURL(), '/');

            assert.equal(store.peekAll('user').length, 0);
            assert.equal(store.peekAll('contact').length, 0);
            assert.equal(store.peekAll('channel').length, 0);
            assert.equal(store.peekAll('user').length, 0);
            assert.equal(store.peekAll('user').length, 0);
          });
        });
      });
    });
  });
});
