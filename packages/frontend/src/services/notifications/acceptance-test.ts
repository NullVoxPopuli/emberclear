
import { module, test } from 'qunit';
import { visit, currentURL, waitFor } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';

import {
  clearLocalStorage,
  setupRelayConnectionMocks,
  cancelLongRunningTimers,
  getService
} from 'emberclear/tests/helpers';

import Notifications from './service';

import { app } from 'emberclear/tests/helpers/pages/app';

module('Acceptance | Notifications Service', function(hooks) {
  setupApplicationTest(hooks);
  clearLocalStorage(hooks);
  setupRelayConnectionMocks(hooks);
  cancelLongRunningTimers(hooks);

  let originalNotification;

  hooks.beforeEach(function() {
    originalNotification = window.Notification;
  });

  hooks.afterEach(function() {
    window.Notification = originalNotification;
  });

  module('permission has not yet been asked for', function(hooks) {
    let notifications!: Notifications;

    hooks.beforeEach(async function() {
      await visit('/');
      window.Notification = {
        permission: undefined
      };

      notifications = getService<Notifications>('notifications');
    });

    test('does not ask by default', function(assert) {
      assert.ok(notifications.isBrowserCapableOfNotifications(), 'Browser is capable of notifications');
      assert.notOk(notifications.isPermissionDenied(), 'Permission has not previously been denied');
      assert.notOk(notifications.isNeverGoingToAskAgain, 'User did not say to never ask again');
      assert.notOk(notifications.isHiddenUntilBrowserRefresh, 'User did not say to ask later');

      assert.notOk(notifications.showInAppPrompt, 'The in-app prompt should not be shown yet');
    });

    module('after a notification is attempted', function(hooks) {
      hooks.beforeEach(function() {
        notifications.info('a test message');
      });

      test('the in-app prompt is shown', function(assert) {
        assert.ok(notifications.isBrowserCapableOfNotifications(), 'Browser is capable of notifications');
        assert.notOk(notifications.isPermissionDenied(), 'Permission has not previously been denied');
        assert.notOk(notifications.isNeverGoingToAskAgain, 'User did not say to never ask again');
        assert.notOk(notifications.isHiddenUntilBrowserRefresh, 'User did not say to ask later');

        assert.ok(notifications.showInAppPrompt, 'The in-app prompt should be shown');
      });
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

    module('permission granted', function(hooks) {

    });

    module('permission: later', function(hooks) {

    });
  });
});
