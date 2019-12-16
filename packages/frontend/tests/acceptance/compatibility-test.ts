import { module, test } from 'qunit';
import { visit, find } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';

import {
  clearLocalStorage,
  setupRelayConnectionMocks,
  setupWorkers,
} from 'emberclear/tests/helpers';

module('Acceptance | Compatibility', function(hooks) {
  setupApplicationTest(hooks);
  setupWorkers(hooks);
  clearLocalStorage(hooks);
  setupRelayConnectionMocks(hooks);

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
    let backupDb: any;
    hooks.beforeEach(async function() {
      backupDb = window.indexedDB;
      delete (window as any).indexedDB;
      await visit('/');
    });
    hooks.afterEach(function() {
      (window as any).indexedDB = backupDb;
    });

    test('the compatibility message is shown', function(assert) {
      let modal = find('[data-test-compatibility-modal]');

      assert.ok(modal, 'the modal should be in the dom');
    });
  });
});
