import { module, test } from 'qunit';
import { visit, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';

import {
  stubService, clearLocalStorage,
  setupCurrentUser
} from 'emberclear/tests/helpers';

module('Acceptance | Add Contact', function(hooks) {
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

  module('Is logged in', function(hooks) {
    setupCurrentUser(hooks);

    test('visiting /contacts | does not redirect', async function(assert) {
      await visit('/contacts');

      assert.equal(currentURL(), '/contacts');
    });
  });
});
