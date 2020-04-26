import { module, test } from 'qunit';
import { visit, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { percySnapshot } from 'ember-percy';

import { nameForm, overwritePage } from 'emberclear/tests/helpers/pages/setup';

import {
  setupCurrentUser,
  trackAsyncDataRequests,
  getStore,
  setupEmberclearTest,
} from 'emberclear/tests/helpers';

module('Acceptance | Setup', function (hooks) {
  setupApplicationTest(hooks);
  setupEmberclearTest(hooks);
  trackAsyncDataRequests(hooks);

  module('is logged in', function (hooks) {
    setupCurrentUser(hooks);

    module('visits /setup', function (hooks) {
      hooks.beforeEach(async function () {
        await visit('/setup');
      });

      test('redirects to warning', function (assert) {
        let text = this.owner.lookup('service:intl').t('ui.setup.overwriteTitle');

        assert.dom('[data-test-focus-card]').containsText(text);
      });

      module('desires to navigate away', function (hooks) {
        hooks.beforeEach(async function () {
          await overwritePage.abort();
        });

        test('redirect to root', function (assert) {
          assert.equal(currentURL(), '/');
        });
      });

      module('confirms re-setup', function (hooks) {
        hooks.beforeEach(async function () {
          await overwritePage.confirm();
        });

        test('redirect to main setup', function (assert) {
          let text = this.owner.lookup('service:intl').t('ui.setup.introQuestion');

          assert.dom('[data-test-focus-card]').containsText(text);

          assert.equal(currentURL(), '/setup');
        });
      });
    });
  });

  module('visiting /setup', function (hooks) {
    hooks.beforeEach(async function () {
      await visit('/setup');
    });

    module('name is not filled in', function () {
      test('proceeding is disallowed', async function (assert) {
        await nameForm.clickNext();

        let text = this.owner.lookup('service:intl').t('ui.setup.almostReady');

        assert.dom('[data-test-focus-card]').doesNotContainText(text);
      });

      test('no record was created', async function (assert) {
        const store = getStore();
        const known = await store.findAll('identity');

        assert.equal(known.length, 0);
      });
    });

    module('name is filled in', function (hooks) {
      hooks.beforeEach(async function () {
        await nameForm.enterName('My Name');

        await nameForm.clickNext();
      });

      test('proceeds to next page', function (assert) {
        let text = this.owner.lookup('service:intl').t('ui.setup.almostReady');

        assert.dom('[data-test-focus-card]').containsText(text);

        percySnapshot(assert as any);
      });

      test('sets the "me" identity', function (assert) {
        const store = getStore();
        const known = store.peekAll('user');

        assert.equal(known.length, 1);
        assert.equal(known.toArray()[0].id, 'me');
      });
    });
  });
});
