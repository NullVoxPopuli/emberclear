import { module, test } from 'qunit';
import { visit, currentURL, waitUntil } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';

import {
  clearLocalStorage,
  setupRelayConnectionMocks,
  setupCurrentUser,
  getService,
} from 'emberclear/tests/helpers';

import { page as settings } from 'emberclear/tests/helpers/pages/settings';
import { defaultRelays } from 'emberclear/utils/data/required-data';
import { settled } from '@ember/test-helpers';

const page = settings.relays;

module('Acceptance | Settings | Relays', function(hooks) {
  setupApplicationTest(hooks);
  clearLocalStorage(hooks);
  setupRelayConnectionMocks(hooks);

  let path = '/settings/relays';

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
      const store = getService('store');

      await store.createRecord('relay', defaultRelays[0]).save();
      await store.createRecord('relay', defaultRelays[1]).save();
      await store.createRecord('relay', defaultRelays[2]).save();
      await visit(path);
    });

    test('the default relays are rendered', function(assert) {
      assert.equal(page.table.rows.length, 3, '1 row per relay');
    });

    // TODO: convert these to integration tests
    module('user removes a relay', function(hooks) {
      hooks.beforeEach(async function(assert) {
        assert.equal(page.table.rows.length, 3, 'there are 3 relays');

        await page.table.rows.objectAt(1)!.remove();
        await settled();
        // TODO: find a way to make this better
        await waitUntil(() => page.table.rows.length === 2);
      });

      test('there is one less row', function(assert) {
        assert.equal(page.table.rows.length, 2, 'there are 2 relays');
      });
    });

    // TODO: convert these to integration tests
    module('user clicks add relay', function(hooks) {
      hooks.beforeEach(async function(assert) {
        assert.notOk(page.form.isVisible, 'form is not visible');
        await page.addRelay();
      });

      test('the form appears', function(assert) {
        assert.ok(page.form.isVisible, 'form is visible');
      });

      module('user saves the relay', function(hooks) {
        hooks.beforeEach(async function() {
          await page.form.fillSocket('socket url');
          await page.form.fillOg('og url');
          await page.form.save();
          await waitUntil(() => !page.form.isVisible);
        });

        test('the form hides', function(assert) {
          assert.notOk(page.form.isVisible, 'form is not visible');
        });

        test('there is now one additional relay in the table', function(assert) {
          assert.equal(page.table.rows.length, 4, '1 row per relay');
        });
      });
    });
  });
});
