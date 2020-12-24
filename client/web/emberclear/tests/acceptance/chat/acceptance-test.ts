import { currentURL } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';

import { setupRelayConnectionMocks } from 'emberclear/tests/helpers';

import { setupWorkers } from '@emberclear/crypto/test-support';
import { clearLocalStorage } from '@emberclear/local-account/test-support';
import { visit } from '@emberclear/test-helpers/test-support';

module('Acceptance | Chat', function (hooks) {
  setupApplicationTest(hooks);
  clearLocalStorage(hooks);
  setupWorkers(hooks);
  setupRelayConnectionMocks(hooks);

  module('when not logged in', function (hooks) {
    hooks.beforeEach(async function () {
      await visit('/chat');
    });

    test('is redirected to setup', function (assert) {
      assert.equal(currentURL(), '/setup');
    });
  });
});
