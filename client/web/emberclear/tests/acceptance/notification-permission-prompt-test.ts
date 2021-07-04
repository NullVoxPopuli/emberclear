import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';

import { setupRelayConnectionMocks } from 'emberclear/tests/helpers';
import { page as app } from 'emberclear/tests/helpers/pages/app';
import { stubConnection } from 'emberclear/tests/helpers/setup-relay-connection-mocks';

import { setupWorkers } from '@emberclear/crypto/test-support';
import { clearLocalStorage, setupCurrentUser } from '@emberclear/local-account/test-support';
import { getService, refresh, visit } from '@emberclear/test-helpers/test-support';

const { notificationPrompt: prompt } = app;

module('Acceptance | Notification Permission Prompt', function (hooks) {
  setupApplicationTest(hooks);
  setupWorkers(hooks);
  setupRelayConnectionMocks(hooks);
  clearLocalStorage(hooks);
  setupCurrentUser(hooks);

  module('permission has not yet been asked for', function (hooks) {
    hooks.beforeEach(async function () {
      getService<any>('window').Notification = { permission: 'default' };

      await visit('/chat/privately-with/me');
    });

    test('the prompt is shown', function (assert) {
      assert.true(prompt.isVisible);
    });

    test('never ask again is clicked', async function (assert) {
      assert.expect(2);

      await prompt.askNever();

      assert.false(prompt.isVisible, 'prompt hides initially');

      await refresh(() => stubConnection());

      assert.false(prompt.isVisible, 'still is not shown even after refresh');
    });

    module('ask later is clicked', function (hooks) {
      hooks.beforeEach(async function () {
        await prompt.askLater();
      });

      test('the prompt is not shown', function (assert) {
        assert.false(prompt.isVisible);
      });

      module('on refresh', function (hooks) {
        hooks.beforeEach(async function () {
          await refresh(() => {
            stubConnection();
            // stub doesn't hold between refreshes
            getService<any>('window').Notification = { permission: 'default' };
          });
        });

        test('the prompt is shown', function (assert) {
          assert.true(prompt.isVisible);
        });
      });
    });

    module('enabled is clicked', function () {});
  });
});
