import { module, test } from 'qunit';

import { visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';

import {
  setupServiceWorkerUpdater,
  serviceWorkerUpdate,
} from 'ember-service-worker-update-notify/test-support/updater';

import { setupRelayConnectionMocks, setupWorkers } from 'emberclear/tests/helpers';

const selector = '.service-worker-update-notify';

module('Acceptance | Update Banner', function(hooks) {
  setupApplicationTest(hooks);
  setupWorkers(hooks);
  setupServiceWorkerUpdater(hooks);
  setupRelayConnectionMocks(hooks);

  hooks.beforeEach(async function() {
    await visit('/');
  });

  test('the notifier is not visible', function(assert) {
    assert.dom(selector).doesNotExist();
  });

  module('an update is ready', function() {
    test('the notifier can become visible', async function(assert) {
      await serviceWorkerUpdate();

      assert.dom(selector).exists();
    });
  });
});
