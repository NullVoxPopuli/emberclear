import { module, test } from 'qunit';
import { visit, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { percySnapshot } from 'ember-percy';

import { nameForm } from 'emberclear/tests/helpers/pages/setup';

import {
  clearLocalStorage,
  setupCurrentUser,
  setupRelayConnectionMocks,
  trackAsyncDataRequests,
  getStore,
} from 'emberclear/tests/helpers';

module('Acceptance | Setup', function(hooks) {
  setupApplicationTest(hooks);
  clearLocalStorage(hooks);
  setupRelayConnectionMocks(hooks);
  trackAsyncDataRequests(hooks);

  module('is logged in', function(hooks) {
    setupCurrentUser(hooks);

    module('visits /setup', function(hooks) {
      hooks.beforeEach(async function() {
        await visit('/setup');
      });

      test('redirects to warning', function(assert) {
        assert.equal(currentURL(), '/setup/overwrite');
      });
    });
  });

  module('visiting /setup', function(hooks) {
    hooks.beforeEach(async function() {
      await visit('/setup');
    });

    test('redirects to setup/new', function(assert) {
      assert.equal(currentURL(), '/setup/new');
      percySnapshot(assert as any);
    });

    module('name is not filled in', function() {
      test('proceeding is disallowed', async function(assert) {
        await nameForm.clickNext();

        assert.equal(currentURL(), '/setup/new');
      });

      test('no record was created', async function(assert) {
        const store = getStore();
        const known = await store.findAll('identity');

        assert.equal(known.length, 0);
      });
    });

    module('name is filled in', function(hooks) {
      hooks.beforeEach(async function() {
        await nameForm.enterName('My Name');

        await nameForm.clickNext();
      });

      test('proceeds to next page', function(assert) {
        assert.equal(currentURL(), '/setup/completed');
        percySnapshot(assert as any);
      });

      test('sets the "me" identity', function(assert) {
        const store = getStore();
        const known = store.peekAll('user');

        assert.equal(known.length, 1);
        assert.equal(known.toArray()[0].id, 'me');
      });
    });
  });
});
