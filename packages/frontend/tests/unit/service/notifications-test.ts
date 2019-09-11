import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

import { clearLocalStorage, getService, stubService } from 'emberclear/tests/helpers';

import Notifications from 'emberclear/services/notifications';

module('Unit | Service | notifications', function(hooks) {
  setupTest(hooks);
  clearLocalStorage(hooks);

  // Replace this with your real tests.
  test('it exists', function(assert) {
    let service = getService<Notifications>('notifications');

    assert.ok(service);
  });

  module('not logged in', function(hooks) {
    hooks.beforeEach(function() {
      stubService('currentUser', {
        isLoggedIn: false,
      });
    });

    test('when undecided', function(assert) {
      getService<any>('window').Notification = { permission: 'default' };

      let service = getService<Notifications>('notifications');
      assert.notOk(service.showInAppPrompt, 'The in-app prompt should not be shown');
    });
  });

  module('already logged in', function(hooks) {
    hooks.beforeEach(function() {
      stubService('currentUser', {
        isLoggedIn: true,
      });
    });

    module('a notification is attempted', function(hooks) {
      let service!: Notifications;

      hooks.beforeEach(async function() {
        getService<any>('window').Notification = { permission: 'default' };
        service = getService<Notifications>('notifications');

        await service.info('eh');
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
  });
});
