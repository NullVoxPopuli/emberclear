import { module, test } from 'qunit';
import { currentURL, waitFor } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { percySnapshot } from 'ember-percy';

import DS from 'ember-data';
import CurrentUserService from 'emberclear/services/current-user/service';

import RedirectManager from 'emberclear/src/services/redirect-manager/service';

import {
  visit,
  getService,
  clearLocalStorage,
  setupCurrentUser,
  setupRelayConnectionMocks,
  clearToasts,
  waitUntilTruthy,
} from 'emberclear/tests/helpers';

import { page as app } from 'emberclear/tests/helpers/pages/app';
import { chat } from 'emberclear/tests/helpers/pages/chat';
import { nameForm, completedPage } from 'emberclear/tests/helpers/pages/setup';

module('Acceptance | Invitations', function(hooks) {
  setupApplicationTest(hooks);
  clearLocalStorage(hooks);
  setupRelayConnectionMocks(hooks);
  clearToasts(hooks);

  module('Is not logged in', function(hooks) {
    hooks.beforeEach(async function() {
      await visit('/invite?name=Test&publicKey=abcdef123456');
    });

    test('a redirect to setup occurs', function(assert) {
      assert.equal(currentURL(), '/setup/new');
      percySnapshot(assert as any);
    });

    test('there is now a pending redirect', function(assert) {
      const redirect = getService<RedirectManager>('redirect-manager');

      assert.ok(redirect.hasPendingRedirect);
    });

    test('the url is stored in localstorage for use later', function(assert) {
      const redirect = getService<RedirectManager>('redirect-manager');
      const url = redirect.attemptedRoute;

      assert.equal(url, '/invite?name=Test&publicKey=abcdef123456');
    });

    module('the user fills in their name and proceeds', function(hooks) {
      hooks.beforeEach(async function() {
        await nameForm.enterName('My Name');
        await nameForm.clickNext();
        await waitFor('[data-test-setup-mnemonic]');
      });

      test('setup has advanced properly', function(assert) {
        assert.equal(currentURL(), '/setup/completed');
        percySnapshot(assert as any);
      });

      test('redirect is still pending', function(assert) {
        const redirect = getService<RedirectManager>('redirect-manager');
        const url = redirect.attemptedRoute;

        assert.ok(redirect.hasPendingRedirect, 'redirect is pending');
        assert.equal(url, '/invite?name=Test&publicKey=abcdef123456', 'url is present');
      });

      module('the user clicks passed the mnemonic screen', function(hooks) {
        hooks.beforeEach(async function() {
          await completedPage.clickNext();
          await waitFor(chat.selectors.form);
        });

        test('the redirect has been evaluated', function(assert) {
          assert.equal(currentURL(), '/chat/privately-with/abcdef123456');
          percySnapshot(assert as any);
        });

        test('the redirect manager has been cleared', function(assert) {
          const redirect = getService<RedirectManager>('redirect-manager');
          const url = redirect.attemptedRoute;

          assert.notOk(redirect.hasPendingRedirect, 'redirect is not pending');
          assert.equal(url, null, 'url is no longer present');
        });
      });
    });
  });

  module('Is logged in', function(hooks) {
    setupCurrentUser(hooks);

    module('the url does not have the required params', function() {
      module('name is missing from a contact invitation', function(hooks) {
        hooks.beforeEach(async function() {
          await visit('/invite?publicKey=whatever');
          await waitFor(app.toast.scope);
        });

        test('a redirect to chat occurs', function(assert) {
          assert.equal(currentURL(), '/chat');
        });

        test('a toast is displayed with an error', function(assert) {
          const text = app.toast.text;

          assert.ok(text.includes('Invalid Invite Link'), 'Toast says invite is invalid');
          percySnapshot(assert as any);
        });
      });

      module('publicKey is missing from a contact invitation', function(hooks) {
        hooks.beforeEach(async function() {
          await visit('/invite?name=Test');
          await waitFor(app.toast.scope);
        });

        test('a redirect to chat occurs', function(assert) {
          assert.equal(currentURL(), '/chat');
        });

        test('a toast is displayed with an error', function(assert) {
          const text = app.toast.text;

          assert.ok(text.includes('Invalid Invite Link'), 'Toast says invite is invalid');
          percySnapshot(assert as any);
        });
      });
    });

    module('the url has the required params for a contact invitation', function() {
      module('the params are invalid', function(hooks) {
        hooks.beforeEach(async function() {
          await visit('/invite?name=Test&publicKey=abz');
          await waitFor(app.toast.scope);
        });

        test('a redirect to chat occurs', function(assert) {
          assert.equal(currentURL(), '/chat');
        });

        test('a toast is displayed with an error', function(assert) {
          const text = app.toast.text;

          assert.ok(text.includes('There was a problem'), 'Toast says there is a problem');
          percySnapshot(assert as any);
        });
      });

      module('the params are valid', function() {
        module('but the user clicks their own contact invite link', function(hooks) {
          hooks.beforeEach(async function() {
            const identity = getService<CurrentUserService>('currentUser');
            const record = identity.record;
            const { name, publicKeyAsHex } = record!;

            await visit(`/invite?name=${name}&publicKey=${publicKeyAsHex}`);
            await waitUntilTruthy(() => app.toast.isVisible);
          });

          test('a redirect to your own chat occurs', function(assert) {
            assert.equal(currentURL(), '/chat/privately-with/me');
            percySnapshot(assert as any);
          });

          test('a toast is displayed with a warning', function(assert) {
            const text = app.toast.text;

            assert.ok(
              text.includes(`You can't invite yourself...`),
              'Toast says you cannot invite yourself'
            );
          });
        });

        module('the params belong to a different user', function(hooks) {
          const escapedName = 'Test%20User';
          const publicKey = '53edcbe7d1cdd289e9f4ea74eab12c6dd78720124efd9ad331d6e174aae5677c';

          hooks.beforeEach(async function() {
            const url = `/invite?name=${escapedName}&publicKey=${publicKey}`;

            await visit(url);
          });

          test('a redirect to the correct direct message chat', function(assert) {
            assert.expect(1);

            assert.equal(currentURL(), `/chat/privately-with/${publicKey}`);
            percySnapshot(assert as any);
          });

          test('the contact is added to the list of contacts', async function(assert) {
            const store = getService<DS.Store>('store');

            const record = await store.findRecord('contact', publicKey);

            assert.ok(record);
          });
        });
      });
    });
  });
});
