import { module, test } from 'qunit';

import { visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { percySnapshot } from 'ember-percy';

import { page } from 'emberclear/tests/helpers/pages/sidebar';

import {
  stubService,
  clearLocalStorage,
  setupCurrentUser,
  setupRelayConnectionMocks,
} from 'emberclear/tests/helpers';

module('Acceptance | Sidebar Visibility', function(hooks) {
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

      await visit('/');
    });

    test('the sidebar is not visible', function(assert) {
      assert.notOk(page.isPresent);
      percySnapshot(assert as any);
    });
  });

  module('When logged in', function(hooks) {
    setupCurrentUser(hooks);

    hooks.beforeEach(async function() {
      await visit('/');
    });

    test('the sidebar is visible', function(assert) {
      assert.ok(page.isPresent);
      percySnapshot(assert as any);
    });

    test('the sidebar is not open', function(assert) {
      assert.notOk(page.isOpen);
    });

    module('the sidebar hamburger is clicked', function(hooks) {
      hooks.beforeEach(async function() {
        await page.toggle();
      });

      test('the sidebar is open', function(assert) {
        assert.ok(page.isOpen);
        percySnapshot(assert as any);
      });

      module('the sidebar close button is clicked', function(hooks) {
        hooks.beforeEach(async function() {
          await page.toggle();
        });

        test('the sidebar is closed', function(assert) {
          assert.notOk(page.isOpen);
          percySnapshot(assert as any);
        });
      });
    });
  });
});
