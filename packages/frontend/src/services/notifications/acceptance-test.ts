import { module, test } from 'qunit';
import { visit, currentURL, waitFor } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';

import {
  clearLocalStorage,
  setupRelayConnectionMocks,
  setupWindowNotification,
  getService,
} from 'emberclear/tests/helpers';

import Notifications from './service';

import { app } from 'emberclear/tests/helpers/pages/app';

module('Acceptance | Notifications Service', function(hooks) {
  setupApplicationTest(hooks);
  clearLocalStorage(hooks);
  setupRelayConnectionMocks(hooks);
  setupWindowNotification(hooks);

  module('permission has not yet been asked for', function(hooks) {
    let notifications!: Notifications;

    hooks.beforeEach(async function() {
      await visit('/');
      window.Notification = {
        permission: undefined,
      };

      notifications = getService<Notifications>('notifications');
    });

    module('permission denied', function(hooks) {
      hooks.beforeEach(function() {
        window.Notification = { permission: 'denied' };
      });

      module('a notification is attempted', function(hooks) {
        hooks.beforeEach(async function() {
          notifications.info('a test message');
          await waitFor(app.selectors.toast);
        });

        test('a toast is displayed', function(assert) {
          assert.ok(app.toastText()!.match(/a test message/));
        });
      });
    });

    module('permission granted', function(hooks) {});

    module('permission: later', function(hooks) {});
  });
});
