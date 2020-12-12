import { currentURL } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';

import { percySnapshot } from 'ember-percy';

import {
  clearLocalStorage,
  getService,
  setupCurrentUser,
  setupRelayConnectionMocks,
  setupWorkers,
  trackAsyncDataRequests,
  visit,
} from 'emberclear/tests/helpers';
import { samplePrivateKey } from 'emberclear/tests/helpers/fixtures';
import { loginForm } from 'emberclear/tests/helpers/pages/login';
import { toast } from 'emberclear/tests/helpers/pages/toast';
import { mnemonicFromNaClBoxPrivateKey } from 'emberclear/workers/crypto/utils/mnemonic';

const behaviors = {
  invalid: {
    clickLogin() {
      module('the login button is clicked', function (hooks) {
        hooks.beforeEach(async function () {
          // loginForm.submit must not be awaited because it
          // calls an ember-concurrency task which will
          // also be awaited and not allow us to test the
          // side-effects
          loginForm.submit();
          await toast.waitForToast();
        });

        test('an error message appears', function (assert) {
          const expected = 'There was a problem logging in...';

          assert.contains(toast.text, expected);
          percySnapshot(assert as any);
        });

        test('navigation does not occur', function (assert) {
          assert.equal(currentURL(), '/login');
        });
      });
    },
  },
};

module('Acceptance | Login', function (hooks) {
  setupApplicationTest(hooks);
  setupWorkers(hooks);
  clearLocalStorage(hooks);
  setupRelayConnectionMocks(hooks);
  trackAsyncDataRequests(hooks);

  module('is logged in', function (hooks) {
    setupCurrentUser(hooks);

    module('visits /login', function (hooks) {
      hooks.beforeEach(async function () {
        await visit('/login');
      });

      test('redirects', function (assert) {
        assert.equal(currentURL(), '/');
      });
    });
  });

  module('is not logged in and visits /login', function (hooks) {
    hooks.beforeEach(async function () {
      await visit('/login');
    });

    test('is not redirected', function (assert) {
      assert.equal(currentURL(), '/login');
      percySnapshot(assert as any);
    });

    behaviors.invalid.clickLogin();

    module('the name field is filled in', function (hooks) {
      hooks.beforeEach(async function () {
        await loginForm.typeName('NullVoxPopuli');
      });

      behaviors.invalid.clickLogin();
    });

    module('the mnemonic is filled in', function (hooks) {
      hooks.beforeEach(async function () {
        await loginForm.typeMnemonic('this is fake');
      });

      behaviors.invalid.clickLogin();
    });

    module('both name and mnemonic are filled in', function () {
      module('with valid values', function (hooks) {
        hooks.beforeEach(async function () {
          const mnemonic = await mnemonicFromNaClBoxPrivateKey(samplePrivateKey);

          await loginForm.typeName('NullVoxPopuli');
          await loginForm.typeMnemonic(mnemonic);
          await loginForm.submit();
        });

        test('redirects to chat', function (assert) {
          assert.equal(currentURL(), '/chat');
          percySnapshot(assert as any);
        });

        test('sets the "me" user', function (assert) {
          const store = getService('store');
          const known = store.peekAll('user');

          assert.equal(known.length, 1);
          assert.equal(known.toArray()[0].id, 'me');
        });
      });
    });
  });
});
