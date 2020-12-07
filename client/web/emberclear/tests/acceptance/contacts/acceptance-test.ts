import { module, test } from 'qunit';
import { currentURL, settled, waitUntil } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { percySnapshot } from 'ember-percy';

import {
  visit,
  clearLocalStorage,
  setupCurrentUser,
  setupRelayConnectionMocks,
  getService,
} from 'emberclear/tests/helpers';

import { contacts } from 'emberclear/tests/helpers/pages/contacts';
import { createContact } from 'emberclear/tests/helpers/factories/contact-factory';
import type User from 'emberclear/models/user';

module('Acceptance | Contacts', function (hooks) {
  setupApplicationTest(hooks);
  clearLocalStorage(hooks);
  setupRelayConnectionMocks(hooks);

  module('when not logged in', function (hooks) {
    hooks.beforeEach(async function () {
      await visit('/contacts');
    });

    test('is redirected to setup', function (assert) {
      assert.equal(currentURL(), '/setup');
    });
  });

  module('Is logged in', function (hooks) {
    setupCurrentUser(hooks);

    test('visiting /contacts | does not redirect', async function (assert) {
      await visit('/contacts');

      assert.equal(currentURL(), '/contacts');
      percySnapshot(assert as any);
    });

    module('a couple contacts exist', function (hooks) {
      let me: User;

      hooks.beforeEach(async function () {
        me = getService('current-user').record!;

        await createContact('First Contact');
        await createContact('Second Contact');

        await visit('/contacts');
      });

      test('there are two contacts', function (assert) {
        const result = contacts.rows.dom().length;

        assert.equal(result, 2);
        percySnapshot(assert as any);
      });

      test('current user does not show up in the contacts', function (assert) {
        const text = contacts.table()!.textContent;
        const myName = me.name!;

        assert.notOk(text!.includes(myName));
      });

      module('a contact is removed', function (hooks) {
        hooks.beforeEach(async function () {
          await contacts.rows.removeAt(1);
          await settled();
          // TODO: find a better way to do this
          await waitUntil(() => contacts.rows.dom().length === 1);
        });

        test('there is one less contact', function (assert) {
          const result = contacts.rows.dom().length;

          assert.equal(result, 1);
          percySnapshot(assert as any);
        });
      });
    });
  });
});
