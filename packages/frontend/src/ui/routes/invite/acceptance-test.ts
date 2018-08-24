import { module, skip, skip as test } from 'qunit';
import { visit as dangerousVisit, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';

import DS from 'ember-data';
import IdentityService from 'emberclear/src/services/identity/service';

import {
  stubService, getService, clearLocalStorage,
  setupCurrentUser
} from 'emberclear/tests/helpers';

import { app } from 'emberclear/tests/helpers/pages/app';

async function visit(url: string) {
  try {
    await dangerousVisit(url);
  } catch (e) {
    console.error(e);
  }
}

module('Acceptance | Open Invitation Link', function(hooks) {
  setupApplicationTest(hooks);
  clearLocalStorage(hooks);

  hooks.beforeEach(function () {
    stubService('relay-connection', {
      connect() { return; }
    }, [
      { in: 'route:application', as: 'relayConnection' },
      { in: 'route:chat', as: 'relayConnection' }
    ]);
  });

  module('Is not logged in', function(hooks) {
    hooks.beforeEach(async function() {
      await visit('/invite?name=Test&publicKey=abcdef123456');
    });

    test('a redirect to setup occurs', function(assert) {
      assert.equal(currentURL(), '/setup/new');
    });


    test('the url is stored in localstorage for use later', function(assert) {
      // TODO:
      assert.expect(0);
    });
  });

  module('Is logged in', function(hooks) {
    setupCurrentUser(hooks);

    module('the url does not have the required params', function() {
      module('name is missing from a contact invitation', function(hooks) {
        hooks.beforeEach(async function() {
          await visit('/invite?publicKey=whatever');
        });

        test('a redirect to chat occurs', function(assert) {
          assert.equal(currentURL(), '/chat');
        });

        test('a toast is displayed with an error', function(assert) {
          const text = app.toast().innerText;

          assert.ok(text.includes('Invalid Invite Link'));
        });
      });

      module('publicKey is missing from a contact invitation', function(hooks) {
        hooks.beforeEach(async function() {
          await visit('/invite?name=Test');
        });

        test('a redirect to chat occurs', function(assert) {
          assert.equal(currentURL(), '/chat');
        });

        test('a toast is displayed with an error', function(assert) {
          const text = app.toast().innerText;

          assert.ok(text.includes('Invalid Invite Link'));
        });
      });

    });

    module('the url has the required params for a contact invitation', function() {
      module('the params are invalid', function(hooks) {
        hooks.beforeEach(async function() {
          await visit('/invite?name=Test&publicKey=abz');
        });

        test('a redirect to chat occurs', function(assert) {
          assert.equal(currentURL(), '/chat');
        });

        test('a toast is displayed with an error', function(assert) {
          const text = app.toast().innerText;

          assert.ok(text.includes('There was a problem'));
        });
      });

      module('the params are valid', function() {
        module('but the user clicks their own contact invite link', function(hooks) {
          hooks.beforeEach(async function() {
            const identity = getService<IdentityService>('identity');
            const record = identity.record;
            const { name, publicKeyAsHex } = record!;

            await visit(`/invite?name=${name}&publicKey=${publicKeyAsHex}`);
          });

          test('a redirect to your own chat occurs', function(assert) {
            assert.equal(currentURL(), '/chat/privately-with/me');
          });

          test('a toast is displayed with a warning', function(assert) {
            const text = app.toast().innerText;

            assert.ok(text.includes(`You can't invite yourself...`));
          });
        });

        module('the params belong to a different user', function(hooks) {
          const escapedName = 'Test%20User';
          const publicKey = '53edcbe7d1cdd289e9f4ea74eab12c6dd78720124efd9ad331d6e174aae5677c';

          hooks.beforeEach(async function() {
            const url = `/invite?name=${escapedName}&publicKey=${publicKey}`;

            await visit(url);
          });

          skip('a redirect to the correct direct message chat', function(assert) {
            assert.expect(1);

            assert.equal(currentURL(), `/chat/privately-with/${publicKey}`);
          });

          test('the contact is added to the list of contacts', async function(assert) {
            const store = getService<DS.Store>('store');

            const record = await store.findRecord('identity', publicKey);

            assert.ok(record);
          });
        });
      });
    });
  });
});
