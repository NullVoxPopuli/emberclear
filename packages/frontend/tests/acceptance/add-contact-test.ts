import { module, test } from 'qunit';
import { visit, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';

import localforage from 'localforage';

module('Acceptance | Add Contact', function(hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(async function() {
    await localforage.clear();
  });

  test('visiting /contacts | redirects to setup', async function(assert) {
    await visit('/contacts');

    assert.equal(currentURL(), '/setup/new');
  });
});
