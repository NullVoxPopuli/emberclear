import { module, skip } from 'qunit';
import { visit, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';

import {
  clearLocalStorage,
  setupRelayConnectionMocks,
  setupWorkers,
} from 'emberclear/tests/helpers';

module('Acceptance | Logout', function(hooks) {
  setupApplicationTest(hooks);
  clearLocalStorage(hooks);
  setupWorkers(hooks);
  setupRelayConnectionMocks(hooks);

  module('when not logged in', function(hooks) {
    hooks.beforeEach(async function() {
      await visit('/logout');
    });

    skip('is redirected to setup', function(assert) {
      assert.equal(currentURL(), '/setup');
    });
  });
});
