import { module, test } from 'qunit';
import { visit, waitFor } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';

import {
  clearLocalStorage,
  setupRelayConnectionMocks,
  getService,
  setupCurrentUser,
} from 'emberclear/tests/helpers';

import { app } from 'emberclear/tests/helpers/pages/app';

import Notifications from 'emberclear/services/notifications';

module('Acceptance | Notifications Service', function(hooks) {
  setupApplicationTest(hooks);
  clearLocalStorage(hooks);
  setupRelayConnectionMocks(hooks);

  module('permission has not yet been asked for', function(hooks) {
    let notifications!: Notifications;

    hooks.beforeEach(async function() {
      await visit('/');

      getService<any>('window').Notification = {
        permission: 'default',
      };

      notifications = getService<Notifications>('notifications');
    });

    module('is logged in', function(hooks) {
      setupCurrentUser(hooks);

      module('visits the setup route', function(hooks) {
        hooks.beforeEach(async function() {
          await visit('/setup/completed');
        });

        test('notifications should not be shown', function(assert) {
          assert.ok(
            notifications.isOnRouteThatDoesNotShowNotifications,
            'the logout route does not allow notifications'
          );

          assert.notOk(notifications.showInAppPrompt, 'The in-app prompt should not be shown');
        });
      });

      module('visits the logout page', function(hooks) {
        hooks.beforeEach(async function() {
          await visit('/logout');
        });

        test('notifications should not be shown', function(assert) {
          assert.ok(
            notifications.isOnRouteThatDoesNotShowNotifications,
            'the logout route does not allow notifications'
          );

          assert.notOk(notifications.showInAppPrompt, 'The in-app prompt should not be shown');
        });
      });

      module('visits the chat route', function(hooks) {
        hooks.beforeEach(async function() {
          await visit('chat');
        });

        module('permission: undecided', function() {
          test('initial checks', function(assert) {
            getService<any>('window').Notification = { permission: 'default' };

            let service = getService<Notifications>('notifications');

            assert.ok(
              service.isBrowserCapableOfNotifications,
              'Browser is capable of notifications'
            );
            assert.notOk(service.isPermissionDenied, 'Permission has not previously been denied');
            assert.notOk(service.isPermissionGranted, 'Permission has not previously been granted');
            assert.notOk(service.isNeverGoingToAskAgain, 'User did not say to never ask again');
            assert.notOk(service.isHiddenUntilBrowserRefresh, 'User did not say to ask later');
            assert.ok(service.showInAppPrompt, 'The in-app prompt should be shown right away');
          });
        });

        module('permission: denied', function() {
          test('service state checks', function(assert) {
            getService<any>('window').Notification = { permission: 'denied' };

            let service = getService<Notifications>('notifications');

            assert.ok(
              service.isBrowserCapableOfNotifications,
              'Browser is capable of notifications'
            );
            assert.ok(service.isPermissionDenied, 'Permission has been denied');
            assert.notOk(service.isPermissionGranted, 'Permission has not previously been granted');
            assert.notOk(service.isNeverGoingToAskAgain, 'User did not say to never ask again');
            assert.notOk(service.isHiddenUntilBrowserRefresh, 'User did not say to ask later');
            assert.notOk(service.showInAppPrompt, 'The in-app prompt should not be shown');
          });
        });

        module('permission: granted', function() {
          test('initial checks', function(assert) {
            getService<any>('window').Notification = { permission: 'granted' };
            let service = getService<Notifications>('notifications');

            assert.ok(
              service.isBrowserCapableOfNotifications,
              'Browser is capable of notifications'
            );
            assert.notOk(service.isPermissionDenied, 'Permission has not previously been denied');
            assert.ok(service.isPermissionGranted, 'Permission has been granted');
            assert.notOk(service.isNeverGoingToAskAgain, 'User did not say to never ask again');
            assert.notOk(service.isHiddenUntilBrowserRefresh, 'User did not say to ask later');
            assert.notOk(
              service.showInAppPrompt,
              'The in-app prompt should not be shown right away'
            );
          });
        });
      });
    });

    module('permission denied', function(hooks) {
      hooks.beforeEach(function() {
        getService<any>('window').Notification = { permission: 'denied' };
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

    // module('permission granted', function(hooks) {});

    // module('permission: later', function(hooks) {});
  });
});
