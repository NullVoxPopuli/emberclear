import { currentURL } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';

import { page } from 'emberclear/components/app/top-nav/user-drop-menu/-page';
import {
  assertExternal,
  setupEmberclearTest,
  setupRelayConnectionMocks,
} from 'emberclear/tests/helpers';
import { page as logoutPage } from 'emberclear/tests/helpers/pages/logout';

import { setupCurrentUser } from '@emberclear/local-account/test-support';
import { stubService, visit } from '@emberclear/test-helpers/test-support';

module('Acceptance | Logout', function (hooks) {
  setupApplicationTest(hooks);
  setupEmberclearTest(hooks);

  module('When not logged in', function (hooks) {
    hooks.beforeEach(async function () {
      stubService('current-user', {
        isLoggedIn: false,
        load() {},
        exists: () => false,
      });

      try {
        await visit('/logout');
      } catch (e) {
        console.error('hi', e);
      }
    });

    test('redirects to setup', function (assert) {
      assert.equal(currentURL(), '/setup');
      assertExternal(assert as any);
    });
  });

  module('When logged in', function (hooks) {
    setupCurrentUser(hooks);
    setupRelayConnectionMocks(hooks);

    hooks.beforeEach(async function () {
      await visit('/');
    });

    module('user dropdown is open', function (hooks) {
      hooks.beforeEach(async function () {
        await page.toggle();
      });

      module('clicking logout', function (hooks) {
        hooks.beforeEach(async function () {
          await page.logout();
        });

        test('navigates to the logout warning page', function (assert) {
          assert.equal(currentURL(), '/logout');
          assertExternal(assert as any);
        });

        module('confirm logout', function (hooks) {
          hooks.beforeEach(async function () {
            await logoutPage.confirmLogout();
          });

          test('the user is logged out', function (assert) {
            assert.equal(currentURL(), '/');
          });
        });
      });
    });
  });
});
