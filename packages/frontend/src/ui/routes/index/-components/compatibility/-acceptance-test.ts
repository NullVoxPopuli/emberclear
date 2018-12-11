import { module, test } from 'qunit';
import { visit, currentURL, find } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';

import {
  clearLocalStorage,
  setupRelayConnectionMocks,
  cancelLongRunningTimers,
  setupWindowNotification,
} from 'emberclear/tests/helpers';

module('Acceptance | Compatibility', function(hooks) {
  setupApplicationTest(hooks);
  clearLocalStorage(hooks);
  setupRelayConnectionMocks(hooks);
  cancelLongRunningTimers(hooks);
  setupWindowNotification(hooks);

  // stub things that may not exist (esp in headless / c.i.)
  hooks.beforeEach(function() {
    window.ServiceWorker = window.ServiceWorker || 'for testing';
  });

  module('the browser supports all required features', function(hooks) {
    hooks.beforeEach(async function() {
      await visit('/');
    });

    test('the compatibility message is not shown', function(assert) {
      let modal = find('[data-test-compatibility-modal]');

      assert.notOk(modal, 'the modal should not be in the dom');
    });
  });

  module('the browser does not support a required feature', function(hooks) {
    hooks.beforeEach(async function() {
      delete window.Notification;
      await visit('/');
    });

    test('the compatibility message is shown', function(assert) {
      let modal = find('[data-test-compatibility-modal]');

      assert.ok(modal, 'the modal should be in the dom');
    });
  });
});
