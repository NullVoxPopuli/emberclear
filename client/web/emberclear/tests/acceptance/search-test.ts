import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';

import { page } from 'emberclear/components/search/-page';
import { setupRelayConnectionMocks, trackAsyncDataRequests } from 'emberclear/tests/helpers';
import { page as app } from 'emberclear/tests/helpers/pages/app';

import { setupWorkers } from '@emberclear/crypto/test-support';
import {
  clearLocalStorage,
  createContact,
  setupCurrentUser,
} from '@emberclear/local-account/test-support';
import { getStore, visit } from '@emberclear/test-helpers/test-support';

module('Acceptance | Search Modal', function (hooks) {
  setupApplicationTest(hooks);
  trackAsyncDataRequests(hooks);
  setupWorkers(hooks);
  setupCurrentUser(hooks);
  setupRelayConnectionMocks(hooks);
  clearLocalStorage(hooks);

  module('there are more results than what are initially displayed', function (hooks) {
    hooks.beforeEach(async function (assert) {
      await createContact(`Contact #1`);
      await createContact(`Contact #2`);
      await createContact(`Contact #3`);
      await createContact(`Contact #4`);
      await createContact(`Contact #5`);
      await createContact(`Contact #6`);
      await createContact(`Contact #7`);
      await createContact(`Contact #8`);
      await createContact(`Contact #9`);
      await createContact(`Contact #10`);

      let contacts = await getStore().findAll('contact');

      assert.equal(contacts.length, 10);

      await visit('/');
      await app.modals.search.open();
    });

    test('there is a max set of contacts rendered', function (assert) {
      assert.equal(page.results.contacts.links.length, 5);
    });

    module('filtering', function (hooks) {
      hooks.beforeEach(async function () {
        await page.input.fillIn('1');
      });

      test('the list is shorter', function (assert) {
        assert.equal(page.results.contacts.links.length, 2);
      });
    });
  });
});
