import StoreService from 'ember-data/store';
import { module, test } from 'qunit';
import { visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';

import {
  clearLocalStorage,
  setupRelayConnectionMocks,
  cancelLongRunningTimers,
  setupCurrentUser,
  getService,
} from 'emberclear/tests/helpers';

import { page } from 'emberclear/tests/helpers/pages/app';

module('Acceptance | Chat', function(hooks) {
  setupApplicationTest(hooks);
  clearLocalStorage(hooks);
  setupRelayConnectionMocks(hooks);
  cancelLongRunningTimers(hooks);
  setupCurrentUser(hooks);

  module('Unread Messages', function(hooks) {
    hooks.beforeEach(async function() {
      // we can't receive unread messages from ourselves
      // so start on that screen
      await visit('/chat/privately-with/me');
    });

    test('when there are 0 messages', function(assert) {
      assert.notOk(page.headerUnread.isPresent, 'indicator is not visible');
    });

    module('Has unread messages', function(hooks) {
      hooks.beforeEach(async function() {
        const store = getService<StoreService>('store');
        const record = store.createRecord('message', {
          target: 'whatever',
          type: 'not ping',
          body: 'a test message',
          to: 'me',
          readAt: null,
        });
        await record.save();
      });

      test('1 message is unread', function(assert) {
        assert.ok(page.headerUnread.isVisible(), 'indicator is visible');
        assert.ok(page.headerUnread.isVisible(), 'indicator is visible');
        assert.ok(page.headerUnread.text.includes('1'), 'has one unread message');
      });
    });
  });
});
