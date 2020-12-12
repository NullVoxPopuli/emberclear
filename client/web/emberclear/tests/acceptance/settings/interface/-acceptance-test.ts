import { currentURL } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';

import {
  clearLocalStorage,
  setupCurrentUser,
  setupRelayConnectionMocks,
  setupWorkers,
  visit,
} from 'emberclear/tests/helpers';
import { page as settings } from 'emberclear/tests/helpers/pages/settings';

const page = settings.interface;

module('Acceptance | Settings | Relays', function (hooks) {
  setupApplicationTest(hooks);
  setupWorkers(hooks);
  clearLocalStorage(hooks);
  setupRelayConnectionMocks(hooks);

  let path = '/settings/interface';

  module('when not logged in', function (hooks) {
    hooks.beforeEach(async function () {
      await visit(path);
    });

    test('is redirected to setup', function (assert) {
      assert.equal(currentURL(), '/setup');
    });
  });

  module('when logged in', function (hooks) {
    setupCurrentUser(hooks);

    hooks.beforeEach(async function () {
      await visit(path);
    });

    test('options are visible', function (assert) {
      assert.ok(page.isVisible, 'option is visible');
    });
  });
});
