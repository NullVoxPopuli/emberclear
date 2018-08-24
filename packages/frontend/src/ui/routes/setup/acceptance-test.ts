import { DS } from 'ember-data';
import { run } from '@ember/runloop';
import { module, test } from 'qunit';
import { visit, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';


import { nameForm } from 'emberclear/tests/helpers/pages/setup';

import {
  stubService, getService, clearLocalStorage,
  setupCurrentUser, createCurrentUser
} from 'emberclear/tests/helpers';

module('Acceptance | Identity Setup', function(hooks) {
  setupApplicationTest(hooks);
  clearLocalStorage(hooks);

  hooks.beforeEach(function () {
    stubService('relay-connection', {
      connect() { return; }
    }, [
      { in: 'route:application', as: 'relayConnection' },
      { in: 'route:chat', as: 'relayConnection' }
    ]);
  });

  module('visiting /setup', function(hooks) {
    hooks.beforeEach(async function() {
      await visit('/setup');
    });

    test('redirects to setup/new', function(assert) {
      assert.equal(currentURL(), '/setup/new');
    });

    module('name is not filled in', function() {
      test('proceeding is disallowed', async function(assert) {
        await nameForm.clickNext();

        assert.equal(currentURL(), '/setup/new');
      });
    });

    module('name is filled in', function(hooks) {
      hooks.beforeEach(async function() {
        await nameForm.enterName('My Name');

        await run(async () => {
          await nameForm.clickNext();
        });
      });

      test('proceeds to next page', function(assert) {
        assert.equal(currentURL(), '/setup/completed');
      });

      test('sets the "me" identity', function(assert) {
        const store = getService<DS.Store>('store');
        const known = store.peekAll('identity');

        assert.equal(known.length, 1);
        assert.equal(known.firstObject.id, 'me');
      });
    });
  });

  module('is logged in', function(hooks) {
    setupCurrentUser(hooks);

    module('visits /setup', function(hooks) {
      hooks.beforeEach(async function() {
        await visit('/setup');
      });

      test('redirects to warning', async function(assert) {
        assert.equal(currentURL(), '/setup/overwrite');
      });
    });
  });
});
