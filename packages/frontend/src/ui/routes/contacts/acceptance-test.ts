import { module, test } from 'qunit';
import { visit, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';

import {
  clearLocalStorage,
  setupCurrentUser, setupRelayConnectionMocks
} from 'emberclear/tests/helpers';

module('Acceptance | Add Contact', function(hooks) {
  setupApplicationTest(hooks);
  clearLocalStorage(hooks);
  setupRelayConnectionMocks(hooks);

  module('when not logged in', function(hooks) {
    hooks.beforeEach(async function() {
      await visit('/contacts');
    });

    test('is redirected to setup', function(assert) {
      assert.equal(currentURL(), '/setup/new');
    });
  });

  module('Is logged in', function(hooks) {
    setupCurrentUser(hooks);

    test('visiting /contacts | does not redirect', async function(assert) {
      await visit('/contacts');

      assert.equal(currentURL(), '/contacts');
    });
  });
});
