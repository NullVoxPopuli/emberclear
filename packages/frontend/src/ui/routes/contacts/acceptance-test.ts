import { module, test } from 'qunit';
import { visit, currentURL, settled } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { percySnapshot } from 'ember-percy';

import {
  clearLocalStorage,
  setupCurrentUser,
  setupRelayConnectionMocks,
  getService,
  createIdentity,
} from 'emberclear/tests/helpers';

import Identity from 'emberclear/src/data/models/identity/model';
import IdentityService from 'emberclear/src/services/identity/service';

import { contacts } from 'emberclear/tests/helpers/pages/contacts';

module('Acceptance | Contacts', function(hooks) {
  setupApplicationTest(hooks);
  clearLocalStorage(hooks);
  setupRelayConnectionMocks(hooks);

  module('when not logged in', function(hooks) {
    hooks.beforeEach(async function() {
      await visit('/contacts');
    });

    test('is redirected to setup', function(assert) {
      assert.equal(currentURL(), '/setup/new');
    });
  });

  module('Is logged in', function(hooks) {
    setupCurrentUser(hooks);

    test('visiting /contacts | does not redirect', async function(assert) {
      await visit('/contacts');

      assert.equal(currentURL(), '/contacts');
      percySnapshot(assert as any);
    });

    module('a couple contacts exist', function(hooks) {
      let me: Identity;

      hooks.beforeEach(async function() {
        me = getService<IdentityService>('identity').record!;

        await createIdentity('First Contact');
        await createIdentity('Second Contact');

        await visit('/contacts');
      });

      test('there are two contacts', function(assert) {
        const result = contacts.rows.dom().length;

        assert.equal(result, 2);
        percySnapshot(assert as any);
      });

      test('current user does not show up in the contacts', function(assert) {
        const text = contacts.table()!.textContent;
        const myName = me.name!;

        assert.notOk(text!.includes(myName));
      });

      module('a contact is removed', function(hooks) {
        hooks.beforeEach(async function() {
          await contacts.rows.removeAt(1);
          await settled();
        });

        test('there is one less contact', function(assert) {
          const result = contacts.rows.dom().length;

          assert.equal(result, 1);
          percySnapshot(assert as any);
        });
      });
    });
  });
});
