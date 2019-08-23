import { module, test } from 'qunit';
import { visit, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';

import { clearLocalStorage, setupRelayConnectionMocks } from 'emberclear/tests/helpers';

module('Acceptance | Chat', function(hooks) {
  setupApplicationTest(hooks);
  clearLocalStorage(hooks);
  setupRelayConnectionMocks(hooks);

  module('when not logged in', function(hooks) {
    hooks.beforeEach(async function() {
      await visit('/chat');
    });

    test('is redirected to setup', function(assert) {
      assert.equal(currentURL(), '/setup/new');
    });
  });
});
