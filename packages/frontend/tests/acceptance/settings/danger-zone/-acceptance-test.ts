import { module, test } from 'qunit';
import { visit, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';

import {
  clearLocalStorage,
  setupRelayConnectionMocks,
  setupCurrentUser,
} from 'emberclear/tests/helpers';

import { page as settings } from 'emberclear/tests/helpers/pages/settings';

const page = settings.dangerZone;

module('Acceptance | Settings | Relays', function(hooks) {
  setupApplicationTest(hooks);
  clearLocalStorage(hooks);
  setupRelayConnectionMocks(hooks);

  let path = '/settings/danger-zone';

  module('when not logged in', function(hooks) {
    hooks.beforeEach(async function() {
      await visit(path);
    });

    test('is redirected to setup', function(assert) {
      assert.equal(currentURL(), '/setup/new');
    });
  });

  module('when logged in', function(hooks) {
    setupCurrentUser(hooks);

    hooks.beforeEach(async function() {
      await visit(path);
    });

    test('delete messages button is visible', function(assert) {
      assert.ok(page.deleteMessages.isVisible, 'button is visible');
    });
  });
});
