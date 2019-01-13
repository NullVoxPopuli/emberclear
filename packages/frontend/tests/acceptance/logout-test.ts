import { module, test } from 'qunit';

import { visit, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { percySnapshot } from 'ember-percy';

import {
  stubService,
  clearLocalStorage,
  setupCurrentUser,
  setupRelayConnectionMocks,
} from 'emberclear/tests/helpers';

import { app } from 'emberclear/tests/helpers/pages/app';

module('Acceptance | Logout', function(hooks) {
  setupApplicationTest(hooks);
  clearLocalStorage(hooks);
  setupRelayConnectionMocks(hooks);

  module('When not logged in', function(hooks) {
    hooks.beforeEach(async function() {
      stubService('identity', {
        isLoggedIn: false,
        load() {},
        exists: () => false,
      });

      await visit('/logout');
    });

    test('redirects to setup', function(assert) {
      assert.equal(currentURL(), '/setup/new');
      percySnapshot(assert as any);
    });
  });

  module('When logged in', function(hooks) {
    setupCurrentUser(hooks);

    hooks.beforeEach(async function() {
      await visit('/');
    });

    module('user dropdown is open', function(hooks) {
      hooks.beforeEach(async function() {
        await app.userDropdown.open();
      });

      test('shows the logout button', function(assert) {
        assert.ok(app.userDropdown.logoutButton());
        percySnapshot(assert as any);
      });

      module('clicking logout', function(hooks) {
        hooks.beforeEach(async function() {
          await app.userDropdown.clickLogout();
        });

        test('navigates to the logout warning page', function(assert) {
          assert.equal(currentURL(), '/logout');
          percySnapshot(assert as any);
        });
      });
    });
  });
});
