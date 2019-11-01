import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import td from 'testdouble';

import { clearLocalStorage, getService, stubService } from 'emberclear/tests/helpers';

import Notifications from 'emberclear/services/notifications';
import WindowService from 'emberclear/services/window';

module('Unit | Service | notifications', function(hooks) {
  setupTest(hooks);
  clearLocalStorage(hooks);

  let service!: Notifications;
  let windowService!: WindowService;

  hooks.beforeEach(function() {
    service = getService('notifications');
    windowService = getService('window');

    windowService.Notification = td.object({
      permission: 'default',
      requestPermission: () => {},
    }) as any;
  });

  hooks.afterEach(function() {
    td.reset();
  });

  module('not logged in', function(hooks) {
    hooks.beforeEach(function() {
      stubService('currentUser', { isLoggedIn: false });
    });

    test('when undecided', function(assert) {
      td.replace(windowService.Notification, 'permission', 'default');

      assert.notOk(service.showInAppPrompt, 'The in-app prompt should not be shown');
    });
  });

  module('already logged in', function(hooks) {
    hooks.beforeEach(function() {
      stubService('currentUser', { isLoggedIn: true });
    });

    module('a notification is attempted', function(hooks) {
      hooks.beforeEach(async function() {
        td.replace(windowService.Notification, 'permission', 'default');

        await service.info('eh, no one will see this :(');
      });

      test('the showInAppPrompt property should still be true', function(assert) {
        assert.ok(service.isBrowserCapableOfNotifications, 'Browser is capable of notifications');
        assert.notOk(service.isPermissionGranted, 'Permission has not previously been granted');
        assert.notOk(service.isPermissionDenied, 'Permission has not previously been denied');
        assert.notOk(service.isNeverGoingToAskAgain, 'User did not say to never ask again');
        assert.notOk(service.isHiddenUntilBrowserRefresh, 'User did not say to ask later');

        assert.ok(service.showInAppPrompt, 'The in-app prompt should be shown');
      });
    });

    module('permission is asked', function(hooks) {
      hooks.beforeEach(function() {
        service.askToEnableNotifications = true;
      });

      test('and permission is granted', async function(assert) {
        assert.expect(1);

        td.when(windowService.Notification.requestPermission()).thenCallback('granted');

        await service.askPermission();

        assert.equal(service.askToEnableNotifications, false);
      });

      test('and permission is denied', async function(assert) {
        assert.expect(1);

        td.when(windowService.Notification.requestPermission()).thenCallback('denied');

        await service.askPermission();

        assert.equal(service.askToEnableNotifications, false);
      });
    });
  });
});
